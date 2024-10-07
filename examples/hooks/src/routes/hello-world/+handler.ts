import type { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  // $ curl http://127.0.0.1:3000/api/hello-world
  app.get('', async () => {
    return { message: 'Hello, World!' };
  });
};
