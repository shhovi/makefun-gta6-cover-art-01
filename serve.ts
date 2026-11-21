import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir: string = path.dirname(fileURLToPath(import.meta.url));
const appDir: string = path.join(rootDir, "app");
const port: number = Number(process.env["PORT"] ?? 8137);
// Serves the offline cover maker from app/; no build step required.

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  const urlPath: string = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
  const rel: string = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file: string = path.join(appDir, rel);
  if (!file.startsWith(appDir)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err: NodeJS.ErrnoException | null, data: Buffer) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext: string = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": types[ext] ?? "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Sunset Panels served at http://localhost:${port}/`);
});
