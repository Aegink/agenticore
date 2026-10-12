import { defineConfig } from "vitest/config";

// win32 专属测试（盘符路径 / SendKeys / Job Object / 受限令牌 / pwsh / 账户
// provision 面）：非 win32 平台排除（含默认 exclude 两项——vitest 的 exclude
// 是替换语义），Windows 全量运行。导出器生成，勿手改（主仓重导出同步）。
const WIN32_ONLY_TESTS = ["src/sandbox/win32-backend.test.ts", "src/sandbox/workspace-sid.test.ts", "src/sandbox/offline-network.test.ts", "src/scheduler/computer-win32.test.ts", "src/context/system-prompt.test.ts", "plugins/tools-builtin/pwsh.test.ts"];

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "plugins/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      ...(process.platform === "win32" ? [] : WIN32_ONLY_TESTS),
    ],
  },
});
