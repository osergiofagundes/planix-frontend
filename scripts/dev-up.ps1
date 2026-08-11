# Sobe o frontend em modo DESENVOLVIMENTO (Vite + HMR), isolado da producao.
#
#   Dev ......... http://localhost:5174  -> chama a API em localhost:8081
#   Producao .... http://localhost:5173  -> nginx, chama /api no mesmo host
#
# Precisa do backend de dev no ar: ..\planix\scripts\dev-up.ps1 -d
#
# Este script existe para evitar erro humano: rodar o mesmo comando SEM
# "-p planix-frontend-2-dev" substituiria o container de producao.
#
# Uso:
#   .\scripts\dev-up.ps1          -> em primeiro plano, com logs
#   .\scripts\dev-up.ps1 -d       -> em segundo plano

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

docker compose -p planix-frontend-2-dev -f compose.yaml -f compose.dev.yaml up @args
