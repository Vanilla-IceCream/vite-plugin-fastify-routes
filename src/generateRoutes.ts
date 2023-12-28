import os from 'os';
import { resolve } from 'path';
import { glob } from 'glob';

import type { PluginOptions } from './types';

const isWindows = os.type() === 'Windows_NT';

export default async (options?: PluginOptions) => {
  const routesDir = options?.routesDir || resolve(process.cwd(), 'src', 'routes');

  const files = await glob(`${routesDir}/**/+handler.{ts,js}`, { posix: true });
  // const files = await glob(`${routesDir}/**/+{handler,hook}.{ts,js}`, { posix: true });

  const lines: string[] = [];
  // const routes = [] as any[];

  files.forEach((item) => {
    let cur = item;
    let comp = item;

    if (isWindows) {
      cur = resolve(process.cwd(), cur).replace(routesDir, '').replace(/\\/g, '/');
      comp = resolve(process.cwd(), comp);
    } else {
      cur = cur.replace(routesDir, '');
    }

    // const key = cur
    //   .replace(/\/\+handler\.(ts|js)/, '')
    //   .replace(/\/\+hook\.(ts|js)/, '')
    //   .split('/')
    //   .filter(Boolean)
    //   .join('/');

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
    lines.push(`app.register(${mod}, { prefix: prefix + '${path}' });`);

    // if (path.includes('+hook')) {
    //   routes.push({
    //     path: path.replace(/\/\+hook\.(ts|js)/, ''),
    //     register: `app.register(${mod});`,
    //     hook: true,
    //     level: 0,
    //     key,
    //   });
    // } else {
    //   routes.push({
    //     path,
    //     register: `app.register(${mod}, { prefix: prefix + '${path}' });`,
    //     level: 0,
    //     key,
    //   });
    // }
  });

  // routes.forEach((item) => {
  //   if (item.path) {
  //     routes
  //       .filter((route) => route.path && route.hook)
  //       .forEach((route) => {
  //         if (item.path.startsWith(route.path)) {
  //           item.level += 1;
  //         }
  //       });
  //   }
  // });

  return `
    export default (app, opts) => {
      const { prefix } = opts;
      ${lines.join('')}
    };
  `;
};
