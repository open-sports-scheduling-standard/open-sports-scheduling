#!/usr/bin/env node

import { main } from "../src/index.js";

main(process.argv).catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
