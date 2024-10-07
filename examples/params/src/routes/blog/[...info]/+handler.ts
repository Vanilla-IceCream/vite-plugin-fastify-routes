import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  // $ curl http://127.0.0.1:3000/api/blog/hello/world/100/fastify
  app.get<{ Params: { '*': string } }>('', async (req, reply) => {
    return reply.send({ message: req.params['*'] });
  });
};
