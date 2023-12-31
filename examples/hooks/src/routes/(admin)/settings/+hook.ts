import plugin from 'fastify-plugin';

export default plugin(async (app) => {
  app.addHook('preHandler', async (request, reply) => {
    await new Promise((resolve, reject) => {
      console.log('[/(admin)/settings] preHandler');
      resolve('');
    });
  });
});
