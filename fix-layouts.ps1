# Script to update all pages to use MainLayout and SidebarLayout
$ErrorActionPreference = "Stop"

# Define helper function for simple page updates
function Update-BasicPage {
    param (
        [string]$PagePath,
        [string]$PageTitle,
        [string]$PageDescription
    )

    $content = Get-Content $PagePath -Raw
    
    # Update imports
    $content = $content -replace 'import \{ Helmet \} from ''react-helmet'';', ''
    $content = $content -replace 'import Header from ''components\/ui\/Header'';', 'import MainLayout from ''components/layout/MainLayout'';'
    $content = $content -replace 'import Footer from ''components\/ui\/Footer'';', ''
    
    # Determine if the page has a render function or return statement
    if ($content -match '<Helmet>[\s\S]*?<\/Helmet>') {
        # Extract title from Helmet if available
        if (-not $PageTitle -and $content -match '<title>(.*?)<\/title>') {
            $PageTitle = $matches[1] -replace ' - HireHub AI', ''
        }
        
        # Extract description from Helmet if available
        if (-not $PageDescription -and $content -match '<meta name="description" content="(.*?)" \/>') {
            $PageDescription = $matches[1]
        }
        
        # Remove Helmet section
        $content = $content -replace '<Helmet>[\s\S]*?<\/Helmet>', ''
    }
    
    # Replace Header and Footer components with MainLayout
    $content = $content -replace '<Header\s*\/>\s*<div className="[^"]*">', "<MainLayout`r`n      title=`"$PageTitle`"`r`n      description=`"$PageDescription`"`r`n    >"
    $content = $content -replace '<\/div>\s*<Footer\s*\/>', '</MainLayout>'
    
    # If no Footer but has closing div
    $content = $content -replace '<\/div>\s*<\/>', '</MainLayout>'
    
    # Save modified content
    Set-Content -Path $PagePath -Value $content

    Write-Host "Updated basic layout for: $PagePath" -ForegroundColor Green
}

function Update-DashboardPage {
    param (
        [string]$PagePath,
        [string]$PageTitle,
        [string]$PageDescription
    )
    
    $content = Get-Content $PagePath -Raw
    
    # Update imports
    $content = $content -replace 'import \{ Helmet \} from ''react-helmet'';', ''
    $content = $content -replace 'import Header from ''components\/ui\/Header'';', 'import MainLayout from ''components/layout/MainLayout'';'
    $content = $content -replace 'import Footer from ''components\/ui\/Footer'';', ''
    
    # Add SidebarLayout import if not already present
    if ($content -notmatch 'import SidebarLayout from') {
        $content = $content -replace 'import MainLayout from ''components/layout/MainLayout'';', "import MainLayout from 'components/layout/MainLayout'`r`nimport SidebarLayout from 'components/layout/SidebarLayout';"
    }
    
    # Extract title and description if available
    if (-not $PageTitle -and $content -match '<title>(.*?)<\/title>') {
        $PageTitle = $matches[1] -replace ' - HireHub AI', ''
    }
    
    if (-not $PageDescription -and $content -match '<meta name="description" content="(.*?)" \/>') {
        $PageDescription = $matches[1]
    }
    
    # Try to save modified content - this is a simplified approach,
    # actual sidebar integration may need more manual attention
    Set-Content -Path $PagePath -Value $content
    
    Write-Host "Started dashboard layout update for: $PagePath" -ForegroundColor Yellow
    Write-Host "Dashboard pages may need manual review to fully integrate the sidebar layout" -ForegroundColor Yellow
}

# Get all pages that need updates
$pageDirectories = Get-ChildItem -Path "e:\hirehub\hirehub_ai-final\src\pages" -Directory
$pagesToUpdate = @()

foreach ($pageDir in $pageDirectories) {
    $indexFile = Join-Path $pageDir.FullName "index.jsx"
    
    # Skip if index.jsx doesn't exist
    if (-not (Test-Path $indexFile)) {
        continue
    }
    
    $content = Get-Content $indexFile -Raw
    $needsUpdate = $false
    
    # Check if using old patterns and not already using MainLayout
    if (($content -match "import Header from" -or 
         $content -match "<Header" -or 
         $content -match "<div className=.container" -or 
         $content -match "<Helmet>") -and 
         ($content -notmatch "MainLayout")) {
        
        $pagesToUpdate += $pageDir.Name
        
        # Determine if this is a dashboard-type page
        $isDashboard = $content -match "sidebar" -or
                      $pageDir.Name -match "dashboard" -or
                      $pageDir.Name -match "admin" -or
                      $pageDir.Name -match "chat"
        
        Write-Host "Processing: $($pageDir.Name) as $(if($isDashboard){'Dashboard'}else{'Basic'}) page" -ForegroundColor Cyan
        
        if ($isDashboard) {
            Update-DashboardPage -PagePath $indexFile -PageTitle "$($pageDir.Name -replace '-', ' ' | % { [regex]::Replace($_, '\b[a-z]', { $args[0].Value.ToUpper() }) })" -PageDescription ""
        } else {
            Update-BasicPage -PagePath $indexFile -PageTitle "$($pageDir.Name -replace '-', ' ' | % { [regex]::Replace($_, '\b[a-z]', { $args[0].Value.ToUpper() }) })" -PageDescription ""
        }
    }
}

Write-Host "`nAttempted to update the following pages:" -ForegroundColor Cyan
$pagesToUpdate | ForEach-Object { Write-Host "  • $_" }
Write-Host "`nPlease manually verify and fine-tune these pages, especially dashboard layouts with sidebars." -ForegroundColor Yellow
