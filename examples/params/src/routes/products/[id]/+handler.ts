import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  app.get<{ Params: { id: string } }>('', async (req, reply) => {
    return reply.send({ message: req.params.id });
  });
};
