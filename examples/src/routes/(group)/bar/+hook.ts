import type { FastifyInstance } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request, reply) => {
    await new Promise((resolve, reject) => {
      console.log('preHandler');
      resolve('');
    });
  });
});
