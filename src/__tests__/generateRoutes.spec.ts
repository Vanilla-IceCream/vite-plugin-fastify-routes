import { resolve } from 'path';
import { test, expect } from 'vitest';

import generateRoutes from '../generateRoutes';

test('generateRoutes', async () => {
  const routesDir = resolve(__dirname, '../../examples/src/routes');
  const generated = await generateRoutes({ routesDir });
  const routes = generated.replace(new RegExp(routesDir, 'g'), '~/routes');

  const expectRoutes = [
    `app.register(import('~/routes/products/+handler.ts'), { prefix: prefix + '/products' });`,
    `app.register(import('~/routes/hello-world/+handler.ts'), { prefix: prefix + '/hello-world' });`,
    `app.register(import('~/routes/products/[id]/+handler.ts'), { prefix: prefix + '/products/:id' });`,
    `app.register(import('~/routes/posts/[[title]]/+handler.ts'), { prefix: prefix + '/posts/:title?' });`,
    `app.register(import('~/routes/blog/[...info]/+handler.ts'), { prefix: prefix + '/blog/*' });`,
    `app.register(import('~/routes/(group)/foo/+handler.ts'), { prefix: prefix + '/foo' });`,
    `app.register(import('~/routes/(group)/bar/+handler.ts'), { prefix: prefix + '/bar' });`,
  ];

  expectRoutes.forEach((item) => {
    expect(routes).toMatch(item);
  });
});
