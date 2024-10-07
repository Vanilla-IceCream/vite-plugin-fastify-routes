import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  // $ curl http://127.0.0.1:3000/api/products/100
  app.get<{ Params: { id: string } }>('', async (req, reply) => {
    return reply.send({ message: req.params.id });
  });
};
