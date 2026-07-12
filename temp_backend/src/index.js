import app from "./app.js";
import config from "./config/env.config.js";
import logger from "./config/logger.config.js";
import connectDB from "./db/index.js";
import getHostIpAddress from "./utils/hostIP.js";

connectDB()
  .then(() => {
    const host = getHostIpAddress();
    const port = config.port || 5000;
    const serverUrl = `http://${host}:${port}`;

    const server = app.listen(port, () => {
      logger.logMessage("success", "Server started successfully");
      logger.logMessage("info", `Server is listening at port: ${port}`);
      logger.logMessage("info", `Server url ==> ${serverUrl}`);
    });

    server.on("error", (error) => {
      logger.logMessage("error", "Server error", error);
    });
  })
  .catch((error) => {
    logger.logMessage("error", "Error while creating server", error);
  });
