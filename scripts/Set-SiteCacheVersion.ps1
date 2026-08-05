param(
    [Parameter(Mandatory = $true)]
    [string]$OutputDirectory,

    [Parameter(Mandatory = $true)]
    [string]$Version
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($Version -notmatch "^[A-Za-z0-9._-]+$") {
    throw "Cache version '$Version' contains unsupported characters."
}

$resolvedOutput = (Resolve-Path -LiteralPath $OutputDirectory).Path
$htmlFiles = @(Get-ChildItem -LiteralPath $resolvedOutput -Filter "*.html" -File -Recurse)
if ($htmlFiles.Count -eq 0) {
    throw "No rendered HTML files were found in $resolvedOutput."
}

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$manifestPath = Join-Path $resolvedOutput "site-version.json"
$manifestJson = @{ version = $Version } | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText($manifestPath, $manifestJson, $utf8WithoutBom)

$cacheableExtensionPattern = "\.(?:css|js|mjs|html|png|jpe?g|gif|svg|webp|avif|ico|pdf|json|xml)(?:$|[?#])"
$attributeRegex = New-Object System.Text.RegularExpressions.Regex(
    "(?i)(?<prefix>\b(?:href|src)=[`"'])(?<url>[^`"']+)(?<suffix>[`"'])"
)

$refreshScript = @'
<script data-site-cache-refresh>
(() => {
  const marker = document.querySelector('meta[name="site-cache-version"]');
  if (!marker || !/^https?:$/.test(window.location.protocol)) return;

  const pageVersion = marker.content;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    try {
      const request = input instanceof Request ? input : null;
      const method = (init && init.method) || (request && request.method) || "GET";
      const url = new URL(request ? request.url : input, window.location.href);

      if (method.toUpperCase() === "GET" && url.origin === window.location.origin) {
        url.searchParams.set("site-version", pageVersion);
        input = request ? new Request(url, request) : url.toString();
      }
    } catch (error) {
      console.warn("Could not version a same-site request.", error);
    }

    return nativeFetch(input, init);
  };

  const endpoint = new URL("/site-version.json", window.location.origin);
  endpoint.searchParams.set("probe", Date.now().toString());

  nativeFetch(endpoint, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" }
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Freshness check returned ${response.status}.`);
      return response.json();
    })
    .then(({ version }) => {
      if (!version || version === pageVersion) {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("site-version") === pageVersion) {
          currentUrl.searchParams.delete("site-version");
          window.history.replaceState(null, "", currentUrl);
        }
        return;
      }

      const refreshedUrl = new URL(window.location.href);
      refreshedUrl.searchParams.set("site-version", version);
      if (refreshedUrl.href !== window.location.href) {
        window.location.replace(refreshedUrl.href);
      }
    })
    .catch((error) => console.warn("Site freshness check failed.", error));
})();
</script>
'@

foreach ($htmlFile in $htmlFiles) {
    $html = [System.IO.File]::ReadAllText($htmlFile.FullName)
    if ($html -match "site-cache-version" -or $html -match "data-site-cache-refresh") {
        throw "$($htmlFile.FullName) already contains a cache-version marker. Start from a clean render."
    }

    $html = $attributeRegex.Replace(
        $html,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($match)

            $url = $match.Groups["url"].Value
            if (
                $url -match "^(?:[a-z][a-z0-9+.-]*:|//|#)" -or
                $url -notmatch $cacheableExtensionPattern
            ) {
                return $match.Value
            }

            $fragment = ""
            $fragmentIndex = $url.IndexOf("#")
            if ($fragmentIndex -ge 0) {
                $fragment = $url.Substring($fragmentIndex)
                $url = $url.Substring(0, $fragmentIndex)
            }

            $separator = if ($url.Contains("?")) { "&" } else { "?" }
            $versionedUrl = "$url${separator}site-version=$Version$fragment"
            return $match.Groups["prefix"].Value + $versionedUrl + $match.Groups["suffix"].Value
        }
    )

    if ($html -notmatch "(?i)</head>") {
        throw "$($htmlFile.FullName) has no closing head element for the cache-version marker."
    }

    $marker = "<meta name=`"site-cache-version`" content=`"$Version`">"
    $injection = $marker + [Environment]::NewLine + $refreshScript + [Environment]::NewLine + "</head>"
    $html = [regex]::Replace($html, "(?i)</head>", $injection, 1)
    [System.IO.File]::WriteAllText($htmlFile.FullName, $html, $utf8WithoutBom)
}

& (Join-Path $PSScriptRoot "Test-SiteCacheVersion.ps1") `
    -OutputDirectory $resolvedOutput `
    -ExpectedVersion $Version
