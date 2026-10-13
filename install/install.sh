#!/usr/bin/env bash
# AI Coding Hub 安装脚本 (macOS / Linux)
# 支持两种运行方式：
#   1) 仓库内：  ./install/install.sh --preset frontend
#   2) 远程一行：curl -fsSL <raw-url>/install/install.sh | bash -s -- --preset frontend
set -euo pipefail

REPO_SLUG="${AI_CODING_HUB_REPO:-xiebrooooo/ai-coding-hub}"
BRANCH="${AI_CODING_HUB_BRANCH:-main}"

info() { printf '\033[36m%s\033[0m\n' "$*"; }
die()  { printf '\033[31m✖ %s\033[0m\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "需要 Node.js 18+（MCP 客户端本身也依赖它）。"
node_major="$(node -p 'process.versions.node.split(".")[0]')"
[ "$node_major" -ge 18 ] 2>/dev/null || die "Node.js 版本过低（当前 $node_major），需要 18+。"

# ---------- 定位仓库根 ----------
ROOT=""
SELF="${BASH_SOURCE[0]:-}"
if [ -n "$SELF" ] && [ -f "$SELF" ]; then
  CAND="$(cd "$(dirname "$SELF")/.." && pwd)"
  [ -d "$CAND/mcps" ] && ROOT="$CAND"
fi

TMPDIR_AH=""
if [ -z "$ROOT" ]; then
  command -v curl >/dev/null 2>&1 || die "需要 curl 下载仓库内容。"
  command -v tar  >/dev/null 2>&1 || die "需要 tar 解压。"
  info "正在获取 ai-coding-hub ($BRANCH)..."
  TMPDIR_AH="$(mktemp -d)"
  BASE="https://github.com/$REPO_SLUG/archive/refs/heads/$BRANCH.tar.gz"
  # 直连失败时回退到 ghproxy 镜像（大陆网络 raw.githubusercontent 不可达）
  MIRROR="https://ghproxy.net/https://github.com/$REPO_SLUG/archive/refs/heads/$BRANCH.tar.gz"
  if ! curl -fsSL "$BASE" | tar -xz -C "$TMPDIR_AH" 2>/dev/null; then
    info "直连失败，改用 ghproxy 镜像重试..."
    curl -fsSL "$MIRROR" | tar -xz -C "$TMPDIR_AH" || die "下载失败。仓库地址: https://github.com/$REPO_SLUG"
  fi
  ROOT="$(find "$TMPDIR_AH" -maxdepth 1 -type d -name '*ai-coding-hub*' | head -n 1)"
  [ -n "$ROOT" ] && [ -d "$ROOT/mcps" ] || die "解压后没找到仓库内容。"
fi

cleanup() { if [ -n "$TMPDIR_AH" ]; then rm -rf "$TMPDIR_AH"; fi; }
trap cleanup EXIT

# ---------- 默认行为 ----------
if [ "$#" -eq 0 ]; then
  info "没有指定参数，默认安装 minimal 预设。"
  info "可用预设见 install/presets.json，或加 --help 查看全部选项。"
  echo
  set -- --preset minimal
fi

exec node "$ROOT/install/apply.mjs" "$@"
