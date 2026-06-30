#!/usr/bin/env node

import { main } from "../src/index.js";

main().catch((err) => {
  console.error("[mcp-npm-publish] 致命错误:", err);
  process.exit(1);
});
