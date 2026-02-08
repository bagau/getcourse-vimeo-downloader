$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ImageName = "getcourse-vimeo"

docker build -t $ImageName $ProjectRoot
Write-Host "Docker image '$ImageName' is ready."
