import path from 'path';
import { test, expect } from 'vitest';

import fastifyRoutes from '../vite-plugin-fastify-routes';

test('vite-plugin-fastify-routes', () => {
  const plugin = fastifyRoutes();
  expect(plugin.name).toBe('vite-plugin-fastify-routes');
});

test('vite-plugin-fastify-routes', () => {
  const plugin = fastifyRoutes({ routesDir: path.resolve(__dirname, '../../examples/src/routes') });
  expect(plugin.name).toBe('vite-plugin-fastify-routes');
});
