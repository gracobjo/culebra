import { buildApp } from "./app.js";
import { config } from "./lib/config.js";

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: config.port, host: "0.0.0.0" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void start();
