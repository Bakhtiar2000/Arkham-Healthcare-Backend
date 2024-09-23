import { Server } from "http";
import app from "./app";
import config from "./app/config";

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("Server is running on ", config.port);
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server Closed!");
      });
    }
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler();
  });
}

main();
