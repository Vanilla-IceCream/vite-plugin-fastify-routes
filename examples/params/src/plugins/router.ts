import plugin from 'fastify-plugin';

import routes from 'virtual:fastify-routes';

export default plugin(
  async (app) => {
    // app.register(
    //   async (app, _opt) => {
    //     app.register(import('~/routes/(group)/foo/+handler'), { prefix: '/foo' });

    //     app.register(async (app) => {
    //       app.register(import('~/routes/(group)/bar/+hook'));
    //       app.register(import('~/routes/(group)/bar/+handler'), { prefix: '/bar' });
    //       app.register(import('~/routes/(group)/bar/baz/+handler'), { prefix: '/bar/baz' });
    //     });
    //   },
    //   { prefix: '/api' },
    // );

    routes(app, { prefix: '/api' });
  },
  { name: 'router' },
);
