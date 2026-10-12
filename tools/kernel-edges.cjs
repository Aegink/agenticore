/**
 * T8-1 后的零出边验收脚本（原 src/kernel 出边统计器——kernel 域删除后
 * 语义升级：① src/kernel 目录不存在（垫片清空）；② src/core 深路径被
 * 非 core 文件引用 = 0（barrel 单一入口——与 architecture-check 双保险）。
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

// ① kernel 域不复存在
if (fs.existsSync(path.join(ROOT, "src", "kernel"))) {
  console.error("✗ src/kernel 仍存在——垫片未清空");
  process.exit(1);
}
console.log("✓ src/kernel 不存在（垫片已清空）");

// ② core 深路径外部引用 = 0
const DOMAINS = new Set(["acp","attachments","cli","context","core","diagnostics","ext-builtin","host","lsp","mcp","models","obs","policy","runtime","sandbox","scheduler","session","sync","test-support"]);
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) out.push(full);
  }
  return out;
}
const coreDeep = /(["'])((?:\.\.?\/)+)core\/(skeleton|primitives|contracts)\//;
let violations = [];
for (const domain of DOMAINS) {
  if (domain === "core") continue;
  const dir = path.join(ROOT, "src", domain);
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir, [])) {
    const text = fs.readFileSync(file, "utf8");
    if (coreDeep.test(text)) violations.push(file);
  }
}
const pluginsDir = path.join(ROOT, "plugins");
for (const file of walk(pluginsDir, [])) {
  const text = fs.readFileSync(file, "utf8");
  if (coreDeep.test(text)) violations.push(file);
}
if (violations.length > 0) {
  console.error("✗ core 深路径外部引用：", violations);
  process.exit(1);
}
console.log("✓ core 深路径外部引用 = 0（barrel 单一入口）");
