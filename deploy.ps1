# Build the plugin and install it into an Obsidian vault under its manifest id.
# Example: .\deploy.ps1 -Repo C:\path\to\obsidian-opencode -Vault C:\path\to\vault
param(
	[Parameter(Mandatory = $true)]
	[string]$Vault,
	[string]$Repo = $PSScriptRoot,
	[switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path (Join-Path $Vault ".obsidian"))) { throw "Not an Obsidian vault: $Vault" }
if (-not (Test-Path (Join-Path $Repo "manifest.json"))) { throw "Not a plugin repository: $Repo" }
Set-Location $Repo

if (-not $SkipBuild) {
	if (-not (Test-Path node_modules)) {
		npm ci
		if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
	}
	npm run build
	if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
}

$id = (Get-Content manifest.json -Raw | ConvertFrom-Json).id
$target = Join-Path $Vault ".obsidian\plugins\$id"
New-Item -ItemType Directory -Force $target | Out-Null
Copy-Item main.js, manifest.json, styles.css $target -Force
Write-Host "Installed $id into $target. Reload the plugin in Obsidian to apply."
