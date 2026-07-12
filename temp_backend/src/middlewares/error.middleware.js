export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
