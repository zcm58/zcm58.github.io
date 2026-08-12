param(
    [string]$Message = "Update website"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
& quarto run (Join-Path $repoRoot "publish-website.ts") --message $Message
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
