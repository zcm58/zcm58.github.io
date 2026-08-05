param(
    [Parameter(Mandatory = $true)]
    [string]$OutputDirectory,

    [Parameter(Mandatory = $true)]
    [string]$ExpectedVersion
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$resolvedOutput = (Resolve-Path -LiteralPath $OutputDirectory).Path
$manifestPath = Join-Path $resolvedOutput "site-version.json"

if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Missing cache-version manifest: $manifestPath"
}

$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
if ($manifest.version -ne $ExpectedVersion) {
    throw "Cache-version manifest contains '$($manifest.version)'; expected '$ExpectedVersion'."
}

$htmlFiles = @(Get-ChildItem -LiteralPath $resolvedOutput -Filter "*.html" -File -Recurse)
if ($htmlFiles.Count -eq 0) {
    throw "No rendered HTML files were found in $resolvedOutput."
}

$escapedVersion = [regex]::Escape($ExpectedVersion)
$cacheableExtensions = "\.(?:css|js|mjs|html|png|jpe?g|gif|svg|webp|avif|ico|pdf|json|xml)(?:$|[?#])"
$attributePattern = "(?i)\b(?:href|src)=[`"'](?<url>[^`"']+)[`"']"

foreach ($htmlFile in $htmlFiles) {
    $html = Get-Content -Raw -LiteralPath $htmlFile.FullName
    $metaCount = [regex]::Matches(
        $html,
        "<meta name=`"site-cache-version`" content=`"$escapedVersion`">"
    ).Count
    $scriptCount = [regex]::Matches($html, "<script data-site-cache-refresh>").Count

    if ($metaCount -ne 1 -or $scriptCount -ne 1) {
        throw "$($htmlFile.FullName) does not contain exactly one cache-version marker and refresh script."
    }

    foreach ($match in [regex]::Matches($html, $attributePattern)) {
        $url = $match.Groups["url"].Value
        if (
            $url -match "^(?:[a-z][a-z0-9+.-]*:|//|#)" -or
            $url -notmatch $cacheableExtensions
        ) {
            continue
        }

        if ($url -notmatch "(?:[?&])site-version=$escapedVersion(?:[&#]|$)") {
            throw "$($htmlFile.FullName) contains an unversioned local resource: $url"
        }
    }
}

Write-Host "Verified cache version $ExpectedVersion across $($htmlFiles.Count) rendered pages." -ForegroundColor Green
