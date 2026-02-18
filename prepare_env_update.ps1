# Script to update Render Env Vars

$headers = @{ "Authorization" = "Bearer rnd_aGALvgJdKUmU0dynL8spWxJQgHgq" }
$services = Invoke-RestMethod -Uri "https://api.render.com/v1/services?limit=20" -Headers $headers
$backend = $services | Where-Object { $_.service.name -eq 'pulsekart-api' }

if (-not $backend) {
    Write-Error "Backend service 'pulsekart-api' not found!"
    exit 1
}

$serviceId = $backend.service.id
Write-Host "Found Service ID: $serviceId"

# Fetch current vars
$currentVars = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/env-vars" -Headers $headers
$varMap = @{}
$currentVars | ForEach-Object { $varMap[$_.envVar.key] = $_.envVar.value }

# Define updates
$updates = @{
    "EMAIL_PROVIDER"   = "sendgrid"
    "SENDGRID_API_KEY" = "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"
    "FROM_EMAIL"       = "2easytech01@gmail.com"
    "FRONTEND_URL"     = "https://pulsekart.in"
    "COMPANY_NAME"     = "PulseKart"
    "ADMIN_PASSWORD"   = [Guid]::NewGuid().ToString() + "Admin!" # Strong enough
    "JWT_SECRET"       = [Guid]::NewGuid().ToString() + [Guid]::NewGuid().ToString()
}

# Merge updates
$updates.Keys | ForEach-Object { $varMap[$_] = $updates[$_] }

# Reconstruct payload
$payload = @()
$varMap.Keys | ForEach-Object {
    $payload += @{ key = $_; value = $varMap[$_] }
}

# Convert to JSON
$jsonPayload = $payload | ConvertTo-Json -Depth 5

# Save payload to file for curl (safer than Invoke-RestMethod for PUT with complex body in PS 5.1 sometimes)
$jsonPayload | Out-File -FilePath "env_vars_payload.json" -Encoding ASCII

Write-Host "Payload prepared. Service ID: $serviceId"
return $serviceId
