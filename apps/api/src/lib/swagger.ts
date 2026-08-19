import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import { config } from "./config.js";
import { buildOpenApiSpec } from "../openapi/spec.js";

export async function registerSwagger(app: FastifyInstance) {
  if (!config.enableSwagger) {
    return;
  }

  const specification = buildOpenApiSpec(config.port);

  await app.register(fastifySwagger, {
    mode: "static",
    specification: {
      document: specification,
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: false,
  });
}
