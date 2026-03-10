$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$openApiCheck = Join-Path $PSScriptRoot "check-openapi-breaking.ps1"

Write-Host "Step 1/2: OpenAPI breaking diff check"
& $openApiCheck
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Step 2/2: Backend API contract tests"
Push-Location (Join-Path $repoRoot "apps/backend")
try {
    $gradleCommand = if (Test-Path ".\gradlew.bat") { ".\gradlew.bat" } else { "./gradlew" }
    & $gradleCommand test --tests "*ContractTest" --rerun-tasks
    $gradleExit = $LASTEXITCODE
} finally {
    Pop-Location
}

exit $gradleExit
