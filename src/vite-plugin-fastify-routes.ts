import type { Plugin } from 'vite';
import { glob } from 'glob';

interface PluginOptions {
  dirs?: string;
}

async function createRoutes(options?: PluginOptions) {
  const dirs = options?.dirs || 'routes';

  const files = await glob(`src/${dirs}/**/registry.ts`);

  const paths = [...files]
    .map((file) => {
      const match = file.match(new RegExp(`^src\\/${dirs}\\/(.*)\\/registry\\.ts$`));

      if (match) {
        let path = '/' + match[1];

        if (/\[\[(.+?)\]\]/g.test(path)) {
          path = path.replace(/\[\[(.+?)\]\]/g, ':$1?');
        }

        if (/\[(.+?)\]/g.test(path)) {
          path = path.replace(/\[(.+?)\]/g, ':$1');
        }

        return path;
      }

      return null;
    })
    .filter(Boolean);

  const lines: string[] = [];

  files.forEach((item, index) => {
    const mod = `import('${item.replace('src', '~')}')`;
    lines.push(`app.register(${mod}, { prefix: prefix + '${paths[index]}' });`);
  });

  return `
    const routes = (app, opts) => {
      const { prefix } = opts;
      ${lines.join('')}
    };

    export default routes;
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
        return createRoutes(options);
      }

      return null;
    },
    configureServer(server) {
      server.watcher.on('add', async (file) => {
        // console.log('file:add', file);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
