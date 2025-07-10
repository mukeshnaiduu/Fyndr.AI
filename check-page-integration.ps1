# Script to identify pages that need updating to use integrated layout components
$ErrorActionPreference = "Stop"

# Define patterns to search for
$oldPatterns = @(
    'import Header from',
    '<Header',
    '<div className="container',
    '<Helmet>'
)

$pageDirectories = Get-ChildItem -Path "e:\hirehub\hirehub_ai-final\src\pages" -Directory
$pagesNeedingUpdate = @()

Write-Host "`nChecking pages that need updating to the integrated layout system..." -ForegroundColor Cyan

foreach ($pageDir in $pageDirectories) {
    $indexFile = Join-Path $pageDir.FullName "index.jsx"
    
    # Skip if index.jsx doesn't exist
    if (-not (Test-Path $indexFile)) {
        continue
    }
    
    $content = Get-Content $indexFile -Raw
    $matchFound = $false
    
    foreach ($pattern in $oldPatterns) {
        if ($content -match [regex]::Escape($pattern)) {
            $matchFound = $true
            break
        }
    }
    
    # Check if already using MainLayout
    $usesMainLayout = $content -match "MainLayout"
    
    if ($matchFound -and -not $usesMainLayout) {
        $pagesNeedingUpdate += $pageDir.Name
    }
}

# Output results
if ($pagesNeedingUpdate.Count -gt 0) {
    Write-Host "`nPages that should be updated to use the integrated layout components:" -ForegroundColor Yellow
    foreach ($page in $pagesNeedingUpdate) {
        Write-Host "  • $page" -ForegroundColor White
    }
} else {
    Write-Host "`nAll pages are already using the integrated layout components!" -ForegroundColor Green
}

Write-Host "`nFollow the instructions in PAGE_INTEGRATION_GUIDE.md to update these pages."
