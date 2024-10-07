import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  // $ curl http://127.0.0.1:3000/api/users
  app.get('', async (req, reply) => {
    return reply.send({ message: 'users' });
  });
};
