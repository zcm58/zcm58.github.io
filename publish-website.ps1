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

function Remove-GeneratedDirectory {
    param([string]$RelativePath)

    $targetPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $RelativePath))
    $repoPrefix = $repoRoot.TrimEnd("\", "/") + [System.IO.Path]::DirectorySeparatorChar
    if (-not $targetPath.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a generated path outside the repository: $targetPath"
    }

    if (Test-Path -LiteralPath $targetPath) {
        Remove-Item -LiteralPath $targetPath -Recurse -Force
    }
}

function Confirm-LiveVersion {
    param(
        [string]$SiteUrl,
        [string]$ExpectedVersion
    )

    $lastProblem = "The live site did not return the expected cache version."
    for ($attempt = 1; $attempt -le 20; $attempt++) {
        $probe = "$ExpectedVersion-$attempt-$([DateTime]::UtcNow.Ticks)"
        try {
            $requestHeaders = @{
                "Cache-Control" = "no-cache"
                "Pragma" = "no-cache"
            }
            $manifestResponse = Invoke-WebRequest `
                -UseBasicParsing `
                -Headers $requestHeaders `
                -Uri "$SiteUrl/site-version.json?probe=$probe"
            $liveVersion = ($manifestResponse.Content | ConvertFrom-Json).version

            if ($liveVersion -eq $ExpectedVersion) {
                $pageResponse = Invoke-WebRequest `
                    -UseBasicParsing `
                    -Headers $requestHeaders `
                    -Uri "$SiteUrl/?site-version=$ExpectedVersion&probe=$probe"
                $escapedVersion = [regex]::Escape($ExpectedVersion)
                if ($pageResponse.Content -match "<meta name=`"site-cache-version`" content=`"$escapedVersion`">") {
                    Write-Host "Verified live cache version: $ExpectedVersion" -ForegroundColor Green
                    return
                }

                $lastProblem = "The live manifest is current, but the live home page is not."
            } else {
                $lastProblem = "The live manifest reports '$liveVersion' instead of '$ExpectedVersion'."
            }
        } catch {
            $lastProblem = $_.Exception.Message
        }

        if ($attempt -lt 20) {
            Start-Sleep -Seconds 3
        }
    }

    throw "Published cache version $ExpectedVersion, but live verification failed: $lastProblem"
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot
$siteUrl = "https://zack-murphy.com"

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

Invoke-Step "Clear generated site output" {
    Remove-GeneratedDirectory "_site"
}

# An active Quarto preview locks .quarto/project-cache/deno-kv-file.
# Keep that internal state in place and refresh execution caches through Quarto.
Invoke-Step "Render Quarto website" {
    quarto render --cache-refresh
}

$cacheVersion = [DateTime]::UtcNow.ToString("yyyyMMddTHHmmssfffZ")
Invoke-Step "Add browser cache version $cacheVersion" {
    & (Join-Path $repoRoot "scripts\Set-SiteCacheVersion.ps1") `
        -OutputDirectory (Join-Path $repoRoot "_site") `
        -Version $cacheVersion
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
    quarto publish gh-pages --no-render --no-prompt --no-browser
}

Invoke-Step "Verify published gh-pages version" {
    git fetch origin gh-pages
    $publishedManifest = git show "origin/gh-pages:site-version.json"
    $publishedVersion = (($publishedManifest -join [Environment]::NewLine) | ConvertFrom-Json).version
    if ($publishedVersion -ne $cacheVersion) {
        throw "gh-pages contains cache version '$publishedVersion'; expected '$cacheVersion'."
    }
}

Invoke-Step "Verify cache-busted live website" {
    Confirm-LiveVersion -SiteUrl $siteUrl -ExpectedVersion $cacheVersion
}

Write-Host ""
Write-Host "Website publish complete: $siteUrl" -ForegroundColor Green
