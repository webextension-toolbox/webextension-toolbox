#!/usr/bin/env node

const toolbox = await import("../dist/index.js");
await toolbox.command();
