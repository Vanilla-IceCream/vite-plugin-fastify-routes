import { resolve } from 'path';
import { test, expect } from 'vitest';
import * as prettier from 'prettier';

import generateRoutes from '../generateRoutes';

test('hooks', async () => {
  const routesDir = resolve(__dirname, '../../examples/hooks/src/routes');
  const generated = await generateRoutes({ routesDir });
  const routes = generated.replace(new RegExp(routesDir, 'g'), '~/routes');

  const formatted = await prettier.format(routes, { parser: 'typescript', printWidth: 999 });

  expect(formatted).toMatchInlineSnapshot(`
    "export default (app, opts) => {
      const { prefix } = opts;
      app.register(async (app) => {
        app.register(import("~/routes/hello-world/+handler.ts"), { prefix: prefix + "/hello-world" });
        app.register(async (app) => {
          app.register(import("~/routes/(authed)/+hook.ts"));
          app.register(async (app) => {
            app.register(import("~/routes/(authed)/users/+hook.ts"));
            app.register(import("~/routes/(authed)/users/+handler.ts"), { prefix: prefix + "/users" });
            app.register(import("~/routes/(authed)/users/[id]/+handler.ts"), { prefix: prefix + "/users/:id" });
          });
          app.register(async (app) => {
            app.register(import("~/routes/(authed)/products/+hook.ts"));
            app.register(import("~/routes/(authed)/products/+handler.ts"), { prefix: prefix + "/products" });
            app.register(import("~/routes/(authed)/products/[id]/+handler.ts"), { prefix: prefix + "/products/:id" });
          });
        });
        app.register(async (app) => {
          app.register(import("~/routes/(admin)/+hook.ts"));
          app.register(async (app) => {
            app.register(import("~/routes/(admin)/settings/+hook.ts"));
            app.register(import("~/routes/(admin)/settings/+handler.ts"), { prefix: prefix + "/settings" });
            app.register(import("~/routes/(admin)/settings/[id]/+handler.ts"), { prefix: prefix + "/settings/:id" });
          });
          app.register(async (app) => {
            app.register(import("~/routes/(admin)/rules/+hook.ts"));
            app.register(import("~/routes/(admin)/rules/+handler.ts"), { prefix: prefix + "/rules" });
            app.register(import("~/routes/(admin)/rules/[id]/+handler.ts"), { prefix: prefix + "/rules/:id" });
          });
        });
      });
    };
    "
  `);
});

test('params', async () => {
  const routesDir = resolve(__dirname, '../../examples/params/src/routes');
  const generated = await generateRoutes({ routesDir });
  const routes = generated.replace(new RegExp(routesDir, 'g'), '~/routes');

  const formatted = await prettier.format(routes, { parser: 'typescript', printWidth: 999 });

  expect(formatted).toMatchInlineSnapshot(`
    "export default (app, opts) => {
      const { prefix } = opts;
      app.register(async (app) => {
        app.register(import("~/routes/products/+handler.ts"), { prefix: prefix + "/products" });
        app.register(import("~/routes/hello-world/+handler.ts"), { prefix: prefix + "/hello-world" });
        app.register(import("~/routes/products/[id]/+handler.ts"), { prefix: prefix + "/products/:id" });
        app.register(import("~/routes/posts/[[title]]/+handler.ts"), { prefix: prefix + "/posts/:title?" });
        app.register(import("~/routes/blog/[...info]/+handler.ts"), { prefix: prefix + "/blog/*" });
        app.register(async (app) => {
          app.register(import("~/routes/(group)/+hook.ts"));
          app.register(import("~/routes/(group)/foo/+handler.ts"), { prefix: prefix + "/foo" });
          app.register(async (app) => {
            app.register(import("~/routes/(group)/bar/+hook.ts"));
            app.register(import("~/routes/(group)/bar/+handler.ts"), { prefix: prefix + "/bar" });
            app.register(import("~/routes/(group)/bar/baz/+handler.ts"), { prefix: prefix + "/bar/baz" });
          });
        });
      });
    };
    "
  `);
});
