import * as path from "node:path";
import { readFileSync } from "node:fs";

// Forks may rename the plugin id; plugin lookups and command ids derive from it.
export const pluginId: string = JSON.parse(readFileSync(path.resolve("manifest.json"), "utf8")).id;
