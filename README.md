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
    preview: 'vite preview',
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
    fastify(),
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

import router from '~/plugins/router';

const app = async (options: FastifyServerOptions = {}) => {
  const app = fastify(options);

  app.register(router);

  return app;
};

export default app;
```

```ts
// src/server.ts
import app from './app';

const start = async () => {
  const server = await app({
    logger: {
      transport: {
        target: '@fastify/one-line-logger',
      },
    },
  });

  try {
    server.listen({ host: '127.0.0.1', port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

```ts
// src/plugins/router.ts
import plugin from 'fastify-plugin';

import routes from 'virtual:fastify-routes';

export default plugin(
  async (app) => {
    routes(app, { prefix: '/api' });
  },
  { name: 'router' },
);
```

```ts
// shims.d.ts
declare module 'virtual:fastify-routes' {
  import type { FastifyPluginAsync } from 'fastify';
  type RouteOptions = { prefix?: string };
  const routes: FastifyPluginAsync<RouteOptions>;
  export default routes;
}
```

```ts
// src/routes/hello-world/registry.ts
import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  // curl http://127.0.0.1:3000/api/hello-world
  app.get('', async () => {
    return { message: 'hello-world' };
  });
};
```

```ts
src/routes/hello-world/registry.ts -> /hello-world

src/routes/products/registry.ts -> /products
src/routes/products/[id]/registry.ts -> /products/:id

src/routes/posts/[[title]]/registry.ts -> /posts/:title?

src/routes/blog/[...info]/registry.ts -> /blog/*
```

```ts
// path/to/registry.ts
import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  // The path parameter can be initialized with an empty string.
  app.get('', async () => {
    // ...
  });
};
```
