param(
    [string]$Message = "Update website"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Label,
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "==> $Label" -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE."
    }
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git was not found. Install Git or run this from a shell where Git is available."
}

if (-not (Get-Command quarto -ErrorAction SilentlyContinue)) {
    throw "Quarto was not found. Install Quarto or run this from a shell where Quarto is available."
}

$branch = (git branch --show-current).Trim()
if ($branch -ne "main") {
    throw "This publish script must be run from the main branch. Current branch: $branch"
}

Invoke-Step "Fetch latest GitHub state" {
    git fetch origin main gh-pages
}

Invoke-Step "Update local main" {
    git pull --ff-only origin main
}

Invoke-Step "Check whitespace" {
    git diff --check
}

Invoke-Step "Render Quarto website" {
    quarto render
}

$status = git status --porcelain --untracked-files=all
if ($status) {
    Invoke-Step "Stage source changes" {
        git add --all -- .
    }

    $staged = git diff --cached --name-only
    if ($staged) {
        Invoke-Step "Commit source changes" {
            git commit -m $Message
        }

        Invoke-Step "Push source changes to main" {
            git push origin main
        }
    } else {
        Write-Host ""
        Write-Host "No source changes to commit after staging." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "No source changes to commit." -ForegroundColor Yellow
}

Invoke-Step "Publish rendered site to GitHub Pages" {
    quarto publish gh-pages --no-prompt --no-browser
}

Write-Host ""
Write-Host "Website publish complete: https://zack-murphy.com" -ForegroundColor Green
