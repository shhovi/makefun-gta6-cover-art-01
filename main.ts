// main.ts — entrypoint: starts the Sunset Panels static server on port 8000.
import { start } from "./serve.ts";

const PORT = 8000;

start(PORT);
console.log(`Sunset Panels running at http://localhost:${PORT}`);
