# Derruba o stack de DESENVOLVIMENTO do frontend. A producao segue de pe.

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

docker compose -p planix-frontend-2-dev -f compose.yaml -f compose.dev.yaml down @args
