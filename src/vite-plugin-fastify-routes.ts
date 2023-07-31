import type { Plugin } from 'vite';
import path from 'path';

import type { PluginOptions } from './types';
import generateRoutes from './generateRoutes';

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
        if (/^\+handler\.(ts|js)$/.test(fileExtension)) server.restart();
      });
    },
  };
}
