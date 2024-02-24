import os from 'os';
import { resolve } from 'path';
import { glob } from 'glob';
import maxBy from 'lodash.maxby';

import type { PluginOptions } from './types';

interface Route {
  path: string;
  register: string;
  hook?: boolean;
  level: number;
  key: string;
}

type NestedRoutes = (Route | NestedRoutes)[];

const isWindows = os.type() === 'Windows_NT';

export default async (options?: PluginOptions) => {
  const routesDir = options?.routesDir || resolve(process.cwd(), 'src', 'routes');

  // const files = await glob(`${routesDir}/**/+handler.{ts,js}`, { posix: true });
  const files = await glob(`${routesDir}/**/+{handler,hook}.{ts,js}`, { posix: true });

  const routes = [] as Route[];

  files.forEach((item) => {
    let cur = item;
    let comp = item;
    // let comp = item.replace(new RegExp(routesDir, 'g'), '~/routes');

    if (isWindows) {
      cur = resolve(process.cwd(), cur).replace(routesDir, '').replace(/\\/g, '/');
      comp = resolve(process.cwd(), comp).replace(/\\/g, '\\\\');
    } else {
      cur = cur.replace(routesDir, '');
    }

    const key = cur
      .replace(/\/\+handler\.(ts|js)/, '')
      .replace(/\/\+hook\.(ts|js)/, '')
      .split('/')
      .filter(Boolean)
      .join('/');

    let path = cur.replace(/\/\+handler\.(ts|js)/, '');

    // /(group) ->
    path = path.replace(/\/\(.+?\)/g, '');
    if (!path) path += '/';

    // /[...wildcard] -> /*
    path = path.replace(/\[\.\.\.([^\]]+)\]/g, '*');

    // /[[id]] -> /:id?
    path = path.replace(/\[\[(.+?)\]\]/g, ':$1?');

    // /[id] -> /:id
    path = path.replace(/\[(.+?)\]/g, ':$1');

    const mod = `import('${comp}')`;

    if (path.includes('+hook')) {
      routes.push({
        path: path.replace(/\/\+hook\.(ts|js)/, ''),
        register: `app.register(${mod});`,
        hook: true,
        level: 0,
        key,
      });
    } else {
      routes.push({
        path,
        register: `app.register(${mod}, { prefix: prefix + '${path}' });`,
        level: 0,
        key,
      });
    }
  });

  routes.forEach((item) => {
    if (item.key) {
      routes
        .filter((route) => route.key && route.hook)
        .forEach((route) => {
          if (item.key.startsWith(route.key)) {
            item.level += 1;
          }
        });
    }
  });

  function createRoutes(
    routes: Route[],
    level = 0,
    curArr: NestedRoutes = [],
    curKeysArr: string[] = [],
  ) {
    const arr = [] as NestedRoutes;
    const keysArr = [] as string[];

    const hooks = routes.filter((r) => r.hook);

    let maxLevelOfHooks = 0;

    if (hooks.length) {
      maxLevelOfHooks = Number(maxBy(hooks, (item) => item.level)?.level) - level;
    } else {
      return routes;
    }

    if (maxLevelOfHooks === 0) {
      const rootRoutes = routes.filter((r) => r.level === 0);
      return [...rootRoutes, ...curArr];
    }

    const hooksMaxLevel = hooks.filter((l) => l.level === maxLevelOfHooks);

    for (let i = 0; i < hooksMaxLevel.length; i++) {
      const hook = hooksMaxLevel[i];

      if (curKeysArr.filter((ck) => ck.startsWith(hook.key)).length) {
        const sameLayer = routes.filter(
          (r) => r.key.startsWith(hook.key) && r.level === maxLevelOfHooks,
        );

        const got = curArr
          .map((subArray) => {
            if (Array.isArray(subArray)) {
              return subArray.filter(
                (route) => !Array.isArray(route) && route.key.startsWith(hook.key),
              );
            }

            return subArray;
          })
          .filter((subArray) => Array.isArray(subArray) && subArray.length);

        const pick = [...sameLayer, ...got];

        arr.push(pick);
      } else {
        const pick = routes.filter(
          (r) => r.key.startsWith(hook.key) && r.level === maxLevelOfHooks,
        );

        arr.push(pick);
      }

      keysArr.push(hook.key);
    }

    return createRoutes(routes, level + 1, arr, keysArr);
  }

  const created = createRoutes(routes);

  function createScope(curRoute: any[]): any[] {
    return [
      { register: 'app.register(async (app) => {' },
      ...curRoute.map((item) => (Array.isArray(item) ? createScope(item) : item)),
      { register: '});' },
    ];
  }

  const scoped = createScope(created);

  function extractRegister(data: any[], result: string[] = []) {
    for (const item of data) {
      if (Array.isArray(item)) {
        extractRegister(item, result);
      } else {
        if (item.hasOwnProperty('register')) {
          result.push(item.register);
        }
      }
    }

    return result;
  }

  const result: string[] = [];
  extractRegister(scoped, result);

  return `
export default (app, opts) => {
  const { prefix } = opts;
  ${result.join('')}
};
`;
};
