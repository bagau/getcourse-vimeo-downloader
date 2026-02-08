$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ImageName = "getcourse-vimeo"
$VideosDir = Join-Path $ProjectRoot "videos"

if (-not (Test-Path $VideosDir)) {
  New-Item -ItemType Directory -Path $VideosDir | Out-Null
}

docker image inspect $ImageName *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker image '$ImageName' not found. Run .\\scripts\\init-docker.ps1 first."
}

docker run --rm `
  -p "3000:3000" `
  -v "${VideosDir}:/app/videos" `
  $ImageName
