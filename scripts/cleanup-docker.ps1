$ErrorActionPreference = "Stop"

$ImageName = "getcourse-vimeo"

$ContainerIds = docker ps -aq
if ($ContainerIds) {
  Write-Host "Removing all containers..."
  docker rm -f $ContainerIds
} else {
  Write-Host "No containers found."
}

docker image inspect $ImageName *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Removing image '$ImageName'..."
  docker image rm -f $ImageName
} else {
  Write-Host "Image '$ImageName' not found."
}

Write-Host "Cleanup finished."
