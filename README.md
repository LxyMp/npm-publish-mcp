# mcp-npm-publish

MCP 服务器，用于 npm 登录/发布/查看包操作。通过 `npx` 直接运行，无需安装。

## 安装

无需安装，直接配置 MCP 客户端：

```json
{
  "mcpServers": {
    "mcp-npm-publish": {
      "command": "npx",
      "args": ["-y", "mcp-npm-publish"],
      "env": {
        "NPM_TOKEN": "${NPM_TOKEN}"
      }
    }
  }
}
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `NPM_TOKEN` | 是 | npm 访问令牌（发布操作必需） |

> 该 MCP 仅用于官方 npm registry，所有命令强制使用 `https://registry.npmjs.org`，不受本地 npmrc 配置影响。

## 工具

| 工具 | 功能 |
|------|------|
| `npm-token-status` | 检查 NPM_TOKEN 状态和登录状态，用于发布/登录前的状态确认 |
| `npm-login` | 登录指引：获取和设置 NPM_TOKEN，首次使用 npm 时由此开始 |
| `npm-publish` | 发布包到 npm registry，自动预检（token、package.json、版本冲突），发现问题时给出诊断和解决指引 |
| `npm-view` | 查看 registry 上的包信息（含个人包），用于发布后验证 |
| `npm-logout` | 退出登录：指引移除 NPM_TOKEN 和撤销 token |

## 使用

```bash
# 设置 token
export NPM_TOKEN="npm_xxxxxx..."

# 检查登录状态
# 调用 npm-token-status

# 登录指引
# 调用 npm-login

# 发布包（带自动预检）
# 调用 npm-publish path="./my-package"

# 查看已发布的包
# 调用 npm-view package="my-package"

# 退出登录
# 调用 npm-logout
```
