param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$ProbePath = "/v3/api-docs",
    [int]$TimeoutSec = 30,
    [int]$IntervalMs = 1000
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($BaseUrl)) {
    Write-Error "BaseUrl must not be empty."
    exit 2
}

$normalizedBaseUrl = $BaseUrl.TrimEnd("/")
$normalizedProbePath = if ($ProbePath.StartsWith("/")) { $ProbePath } else { "/$ProbePath" }
$uri = "$normalizedBaseUrl$normalizedProbePath"

$deadline = (Get-Date).AddSeconds($TimeoutSec)
$lastError = $null

while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -Uri $uri -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "OK: backend is reachable at $uri (HTTP $($response.StatusCode))."
            exit 0
        }
        $lastError = "Unexpected status code $($response.StatusCode)"
    } catch {
        $lastError = $_.Exception.Message
    }

    Start-Sleep -Milliseconds $IntervalMs
}

Write-Error "Health check failed for $uri within ${TimeoutSec}s. Last error: $lastError"
exit 1
