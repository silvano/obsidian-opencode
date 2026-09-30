# Build the plugin and install it into an Obsidian vault under its manifest id.
param(
	[string]$Vault = "C:\path\to\vault",
	[switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

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
