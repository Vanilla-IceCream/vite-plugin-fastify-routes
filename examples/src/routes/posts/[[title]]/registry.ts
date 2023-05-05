import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  app.get('', async (req, reply) => {
    if (req.params.title) {
      return reply.send({ message: req.params.title });
    }

    return reply.send({ message: 'posts' });
  });
};
