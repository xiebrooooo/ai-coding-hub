#Requires -Version 7.0
# AI Coding Hub 安装脚本 (Windows)
#   .\install\install.ps1 -preset frontend
#   iwr -useb <raw-url>/install/install.ps1 | iex
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $Arguments
)

$ErrorActionPreference = 'Stop'

$repoSlug = if ($env:AI_CODING_HUB_REPO) { $env:AI_CODING_HUB_REPO } else { 'xiebrooooo/ai-coding-hub' }
$branch   = if ($env:AI_CODING_HUB_BRANCH) { $env:AI_CODING_HUB_BRANCH } else { 'main' }

function Write-Info([string] $m) { Write-Host $m -ForegroundColor Cyan }
function Die([string] $m) { Write-Host "x $m" -ForegroundColor Red; exit 1 }

if (-not (Get-Command node -ErrorAction Ignore)) {
    Die '需要 Node.js 18+（MCP 客户端本身也依赖它）。'
}
$nodeMajor = [int](& node -p 'process.versions.node.split(".")[0]')
if ($nodeMajor -lt 18) { Die "Node.js 版本过低（当前 $nodeMajor），需要 18+。" }

# ---------- 定位仓库根 ----------
$root = $null
if ($PSScriptRoot) {
    $cand = Split-Path -Parent $PSScriptRoot
    if (Test-Path (Join-Path $cand 'mcps')) { $root = $cand }
}

$tmp = $null
if (-not $root) {
    Write-Info "正在获取 ai-coding-hub ($branch)..."
    $tmp = Join-Path ([IO.Path]::GetTempPath()) ('aih-' + [Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tmp -Force | Out-Null
    $url = "https://github.com/$repoSlug/archive/refs/heads/$branch.tar.gz"
    $zip = Join-Path $tmp 'src.tar.gz'
    try {
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
    } catch {
        Die "下载失败。仓库地址: $url"
    }
    & tar -xzf $zip -C $tmp
    $root = Get-ChildItem -LiteralPath $tmp -Directory |
            Where-Object { $_.Name -like '*ai-coding-hub*' } |
            Select-Object -First 1 -ExpandProperty FullName
    if (-not $root) { Die '解压后没找到仓库内容。' }
}

if (-not $Arguments -or $Arguments.Count -eq 0) {
    Write-Info '没有指定参数，默认安装 minimal 预设。'
    Write-Info '可用预设见 install/presets.json，或加 --help 查看全部选项。'
    Write-Host ''
    $Arguments = @('--preset', 'minimal')
}

try {
    & node (Join-Path $root 'install/apply.mjs') @Arguments
    exit $LASTEXITCODE
} finally {
    if ($tmp -and (Test-Path -LiteralPath $tmp)) {
        Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction Ignore
    }
}
