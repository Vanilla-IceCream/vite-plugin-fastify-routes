import path from 'path';
import { glob } from 'glob';

import type { PluginOptions } from './types';

export default async (options?: PluginOptions) => {
  const routesDir = options?.routesDir || path.resolve(process.cwd(), 'src', 'routes');

  const files = await glob(`${routesDir}/**/+handler.{ts,js}`, { posix: true });

  const lines: string[] = [];

  files.forEach((item) => {
    let path = item.replace(routesDir, '').replace(/\/\+handler\.(ts|js)/, '');

    // /(group) ->
    path = path.replace(/\/\(.+?\)/g, '');
    if (!path) path += '/';

    // /[...wildcard] -> /*
    path = path.replace(/\[\.\.\.([^\]]+)\]/g, '*');

    // /[[id]] -> /:id?
    path = path.replace(/\[\[(.+?)\]\]/g, ':$1?');

    // /[id] -> /:id
    path = path.replace(/\[(.+?)\]/g, ':$1');

    const mod = `import('${item}')`;
    lines.push(`app.register(${mod}, { prefix: prefix + '${path}' });`);
  });

  return `
    export default (app, opts) => {
      const { prefix } = opts;
      ${lines.join('')}
    };
  `;
};
