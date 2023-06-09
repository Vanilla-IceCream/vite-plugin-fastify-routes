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

### Add Scripts

Add the following scripts to your `package.json` file:

```json
{
  // ...
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  // ...
}
```

### Configure Vite

Configure Vite by creating a `vite.config.ts` file in the root directory of your project, as shown below:

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
  plugins: [fastify(), fastifyRoutes()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
});
```

### Create the Fastify Application

Create a Fastify application by defining `src/app.ts`:

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

### Start the Server

Start the server by defining `src/server.ts`:

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

### Create the Router Plugin

Create the router plugin by defining `src/plugins/router.ts`:

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

#### Type

```diff
// tsconfig.json
  "types": [
    // ...
+   "vite-plugin-fastify-routes/client",
  ],
```

or

```ts
// vite-env.d.ts
/// <reference types="vite-plugin-fastify-routes/client" />
```

### Define Routes

Define routes by creating files in the `src/routes` directory:

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

### Route File Naming Convention

The file naming convention for the routes is as follows:

```coffee
src/routes/hello-world/registry.ts -> /hello-world

src/routes/products/registry.ts -> /products
src/routes/products/[id]/registry.ts -> /products/:id

src/routes/posts/[[title]]/registry.ts -> /posts/:title?

src/routes/blog/[...info]/registry.ts -> /blog/*

src/routes/(group)/foo/registry.ts -> /foo
src/routes/(group)/bar/registry.ts -> /bar

src/routes/(freeze)/registry.ts -> /
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
