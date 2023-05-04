# vite-plugin-fastify-routes

File system based routing for Fastify applications using Vite.

## Installation

Install `vite-plugin-fastify-routes` with your favorite package manager:

```sh
$ npm i vite-plugin-fastify-routes -D
# or
$ yarn add vite-plugin-fastify-routes -D
# or
$ pnpm i vite-plugin-fastify-routes -D
# or
$ bun add vite-plugin-fastify-routes -D
```

## Usage

```json5
// package.json
{
  // ...
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'node dist/server.mjs',
  },
  // ...
}
```

```ts
// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import fastify from 'vite-plugin-fastify';
import fastifyRoutes from 'vite-plugin-fastify-routes';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  plugins: [
    fastify({
      appPath: './src/app.ts',
      serverPath: './src/server.ts',
    }),
    fastifyRoutes(),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
});
```

```ts
// src/app.ts
import type { FastifyServerOptions } from 'fastify';
import fastify from 'fastify';

const app = async (options: FastifyServerOptions = {}) => {
  const app = fastify(options);

  app.get('/api/hello-world', async (req, reply) => {
    return reply.send('Hello, World!');
  });

  return app;
};

export default app;
```

```ts
// src/server.ts
import app from './app';

const start = async () => {
  const server = await app();

  try {
    server.listen({ host: '127.0.0.1', port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```
