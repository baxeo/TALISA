import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(fileURLToPath(import.meta.url));
const node = process.execPath;

const backend = spawn(node, [path.join(root, "server.js")], { stdio: "inherit" });
const frontend = spawn(node, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "--host", "0.0.0.0"], { stdio: "inherit" });

function stop() {
  backend.kill();
  frontend.kill();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

backend.on("exit", (code) => {
  if (code && code !== 130) frontend.kill();
});

frontend.on("exit", (code) => {
  if (code && code !== 130) backend.kill();
});