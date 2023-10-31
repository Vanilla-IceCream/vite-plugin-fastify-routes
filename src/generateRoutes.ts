import os from 'os';
import { resolve } from 'path';
import { glob } from 'glob';

import type { PluginOptions } from './types';

const isWindows = os.type() === 'Windows_NT';

export default async (options?: PluginOptions) => {
  const routesDir = options?.routesDir || resolve(process.cwd(), 'src', 'routes');

  const files = await glob(`${routesDir}/**/+handler.{ts,js}`, { posix: true });

  const lines: string[] = [];

  files.forEach((item) => {
    let cur = item;
    let comp = item;

    if (isWindows) {
      cur = resolve(process.cwd(), cur).replace(routesDir, '').replace(/\\/g, '/');
      comp = resolve(process.cwd(), comp);
    } else {
      cur = cur.replace(routesDir, '');
    }

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
  });

  return `
    export default (app, opts) => {
      const { prefix } = opts;
      ${lines.join('')}
    };
  `;
};
