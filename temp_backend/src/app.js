import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import groupRoutes from "./routes/group.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Mahila Bachatgat API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
