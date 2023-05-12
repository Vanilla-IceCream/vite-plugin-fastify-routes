import type { Plugin } from 'vite';
import path from 'path';
import { glob } from 'glob';

interface PluginOptions {
  /**
   * Directory of the `routes`. Defaults to `src/routes`.
   */
  routesDir?: string;
}

async function generateRoutes(options?: PluginOptions) {
  const routesDir = options?.routesDir || path.resolve(process.cwd(), 'src/routes');

  const files = await glob(`${routesDir}/**/registry.{ts,js}`);

  const paths = [...files]
    .map((file) => {
      const match = file.match(new RegExp(`^${routesDir}\\/(.*)\\/registry\\.(ts|js)$`));

      if (match) {
        let path = '/' + match[1];

        // /(group) ->
        path = path.replace(/\/\(.+?\)/g, '');
        if (!path) path += '/';

        // /[...wildcard] -> /*
        path = path.replace(/\[\.\.\.([^\]]+)\]/g, '*');

        // /[[id]] -> /:id?
        path = path.replace(/\[\[(.+?)\]\]/g, ':$1?');

        // /[id] -> /:id
        path = path.replace(/\[(.+?)\]/g, ':$1');

        return path;
      }

      return null;
    })
    .filter(Boolean);

  const lines: string[] = [];

  files.forEach((item, index) => {
    const mod = `import('${item}')`;
    lines.push(`app.register(${mod}, { prefix: prefix + '${paths[index]}' });`);
  });

  return `
    export default (app, opts) => {
      const { prefix } = opts;
      ${lines.join('')}
    };
  `;
}

export default function fastifyRoutes(options?: PluginOptions): Plugin {
  return {
    name: 'vite-plugin-fastify-routes',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'virtual:fastify-routes') return source;
      return null;
    },
    async load(id) {
      if (id === 'virtual:fastify-routes') {
        return generateRoutes(options);
      }

      return null;
    },
    configureServer(server) {
      server.watcher.on('add', async (filePath) => {
        const fileExtension = path.basename(filePath);
        if (/^registry\.(ts|js)$/.test(fileExtension)) server.restart();
      });
    },
  };
}
