import express from "express";
import authRoutes from "./auth.routes.js";
import logsRouter from "./logs.routes.js";
import userRoutes from "./user.routes.js";
import profileRouter from "./profile.routes.js";
import notificationRouter from "./notifications.routes.js";
import communityRouter from "./community.routes.js";
const router = express.Router();

// Routes index
const defaultRoutes = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/logs",
        route: logsRouter,
    },

    {
        path: "/user",
        route: userRoutes,
    },
    {
        path: "/profiles",
        route: profileRouter,
    },

    {
        path: "/notifications",
        route: notificationRouter,
    },
    {
        path: "/community",
        route: communityRouter,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

const mainRouter = router;
export default mainRouter;
