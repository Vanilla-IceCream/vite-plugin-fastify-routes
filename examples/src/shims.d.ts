declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;

    HOST: string;
    PORT: number;
  }
}

declare module 'virtual:fastify-routes' {
  import type { FastifyPluginAsync } from 'fastify';
  type RouteOptions = { prefix?: string };
  const routes: FastifyPluginAsync<RouteOptions>;
  export default routes;
}
