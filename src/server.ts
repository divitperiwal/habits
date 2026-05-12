import http from "node:http";
import app from "./app";
import { gracefulShutdown } from "./utils/response/shutdown";
import { startJobs } from "@/jobs";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startJobs();
});

process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
process.on("uncaughtException", (error) => gracefulShutdown(server, "uncaughtException", error));
process.on("unhandledRejection", (reason) => gracefulShutdown(server, "unhandledRejection", reason));


