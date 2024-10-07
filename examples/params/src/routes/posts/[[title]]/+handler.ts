import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  // $ curl http://127.0.0.1:3000/api/posts
  // $ curl http://127.0.0.1:3000/api/posts/hello-fastify
  app.get<{ Params: { title?: string } }>('', async (req, reply) => {
    if (req.params.title) {
      return reply.send({ message: req.params.title });
    }

    return reply.send({ message: 'posts' });
  });
};
