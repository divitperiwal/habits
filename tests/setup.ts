import type { Server } from "node:http";
import app from "@/app";

let server: Server | null = null;
let baseUrl = "";


export const ensureServer = async () => {
    if (server) return baseUrl;

    const activeServer = app.listen(0);
    server = activeServer;
    await new Promise((resolve) => activeServer.once("listening", resolve));
    const address = activeServer.address() as { port: number };
    baseUrl = `http://127.0.0.1:${address.port}`;

    return baseUrl;
};

