#!/usr/bin/env node

/**
 * npm-publish MCP Server
 *
 * 完整工作流：登录 → 检查 → 发布 → 验证
 * 每个环节报错都给出可操作的提示。
 *
 * 环境变量：
 *   NPM_TOKEN   - npm 访问令牌（发布操作必需）
 *   NPM_REGISTRY - 自定义 registry 地址（默认 https://registry.npmjs.org）
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, unlinkSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

const NPM_TOKEN = process.env.NPM_TOKEN || "";
const NPM_REGISTRY = process.env.NPM_REGISTRY || "https://registry.npmjs.org";
const PACKAGE_NAME = "npm-publish-mcp";
const PACKAGE_VERSION = "1.0.1";

function createTempNpmrc() {
  const tmpDir = mkdtempSync(join(tmpdir(), "npm-mcp-"));
  const npmrcPath = join(tmpDir, ".npmrc");
  const registryUrl = NPM_REGISTRY.replace(/^https?:\/\//, "");
  const content = [
    `//${registryUrl}/:_authToken=${NPM_TOKEN}`,
    `registry=${NPM_REGISTRY}`,
  ].join("\n") + "\n";
  writeFileSync(npmrcPath, content, "utf-8");
  return { tmpDir, npmrcPath };
}

function runNpm(args, options = {}) {
  const { cwd, timeout = 60000 } = options;
  const env = { ...process.env };
  for (const k of Object.keys(env)) {
    if (/^npm_config_registry/i.test(k) || /^npm_registry$/i.test(k)) {
      delete env[k];
    }
  }
  let npmrcPath = null;
  const npmArgs = [...args];
  npmArgs.unshift("--registry", NPM_REGISTRY);
  if (NPM_TOKEN) {
    const { tmpDir, npmrcPath: rcPath } = createTempNpmrc();
    npmrcPath = rcPath;
    npmArgs.unshift("--userconfig", rcPath);
  }
  delete env.NPM_TOKEN;
  try {
    const stdout = execSync(`npm ${npmArgs.join(" ")}`, {
      cwd: cwd || process.cwd(), env, timeout,
      encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
    });
    return { success: true, stdout: stdout.trim(), stderr: "" };
  } catch (err) {
    return { success: false, stdout: (err.stdout || "").trim(), stderr: (err.stderr || "").trim() };
  } finally {
    if (npmrcPath) {
      try { unlinkSync(npmrcPath); } catch {}
      try { rmSync(dirname(npmrcPath), { recursive: true, force: true }); } catch {}
    }
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[npm-publish-mcp] v${PACKAGE_VERSION} started, NPM_TOKEN ${NPM_TOKEN ? "ok" : "missing"}`);
}
main().catch(e => { console.error(e); process.exit(1); });
