const logger = {
  logMessage: (level, message, details) => {
    const formatted = details ? `${message} ${JSON.stringify(details)}` : message;
    if (level === "error") {
      console.error(`[${level}] ${formatted}`);
    } else if (level === "warn") {
      console.warn(`[${level}] ${formatted}`);
    } else {
      console.log(`[${level}] ${formatted}`);
    }
  },
};

export default logger;
