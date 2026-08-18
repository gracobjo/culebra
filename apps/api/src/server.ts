import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "culebra-api",
    phase: 1,
  };
});

const port = Number(process.env.API_PORT ?? 4000);

const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
