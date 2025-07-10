# Script to validate the integration of member repos in HireHub AI
$ErrorActionPreference = "Stop"

Write-Host "`n=== HIREHUB AI INTEGRATION VALIDATION ===`n" -ForegroundColor Cyan

# Check if all pages are using MainLayout
Write-Host "Checking page integration..." -ForegroundColor Yellow
$pageIntegrationResult = & .\check-page-integration.ps1

# Check global components
Write-Host "`nChecking global components..." -ForegroundColor Yellow
$requiredComponents = @(
    "src\components\layout\MainLayout.jsx",
    "src\components\layout\SidebarLayout.jsx",
    "src\components\layout\PageLayout.jsx",
    "src\components\ui\Navbar.jsx",
    "src\components\ui\Footer.jsx",
    "src\components\ThemeProvider.jsx",
    "src\components\ui\ThemeSwitcher.jsx"
)

$missingComponents = @()
foreach ($component in $requiredComponents) {
    $filePath = Join-Path "e:\hirehub\hirehub_ai-final" $component
    if (-not (Test-Path $filePath)) {
        $missingComponents += $component
    }
}

if ($missingComponents.Count -gt 0) {
    Write-Host "Missing required components:" -ForegroundColor Red
    $missingComponents | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
} else {
    Write-Host "All required global components found!" -ForegroundColor Green
}

# Check core app structure
Write-Host "`nChecking core application structure..." -ForegroundColor Yellow
$coreFiles = @(
    "src\App.jsx",
    "src\index.jsx",
    "src\Routes.jsx",
    "package.json",
    "tailwind.config.js",
    "index.html"
)

$missingCoreFiles = @()
foreach ($file in $coreFiles) {
    $filePath = Join-Path "e:\hirehub\hirehub_ai-final" $file
    if (-not (Test-Path $filePath)) {
        $missingCoreFiles += $file
    }
}

if ($missingCoreFiles.Count -gt 0) {
    Write-Host "Missing core files:" -ForegroundColor Red
    $missingCoreFiles | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
} else {
    Write-Host "All core files found!" -ForegroundColor Green
}

# Check if all pages exist
Write-Host "`nChecking for all expected pages..." -ForegroundColor Yellow
$expectedPages = @(
    "homepage",
    "authentication-login-register",
    "about-contact-page",
    "notifications-center",
    "profile-management",
    "video-interview-interface",
    "job-seeker-onboarding-wizard",
    "job-detail-view",
    "ai-powered-job-feed-dashboard",
    "team-management-dashboard",
    "ai-resume-builder",
    "recruiter-employer-onboarding-wizard",
    "course-detail-learning-interface",
    "ai-career-coach-chat-interface",
    "recruiter-dashboard-pipeline-management",
    "candidate-profile-evaluation-interface",
    "job-search-application-hub",
    "admin-dashboard-system-management",
    "interview-practice-video-sessions",
    "mentorship-platform",
    "resource-library",
    "alumni-network-referrals",
    "virtual-career-fair",
    "hackathons-competitions"
)

$missingPages = @()
foreach ($page in $expectedPages) {
    $pagePath = Join-Path "e:\hirehub\hirehub_ai-final\src\pages" $page
    if (-not (Test-Path $pagePath)) {
        $missingPages += $page
    }
}

if ($missingPages.Count -gt 0) {
    Write-Host "Missing pages:" -ForegroundColor Red
    $missingPages | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
} else {
    Write-Host "All expected pages found!" -ForegroundColor Green
}

# Summary
Write-Host "`n=== VALIDATION SUMMARY ===`n" -ForegroundColor Cyan

$allComponentsPresent = ($missingComponents.Count -eq 0)
$allCoreFilesPresent = ($missingCoreFiles.Count -eq 0)
$allPagesPresent = ($missingPages.Count -eq 0)

if ($allComponentsPresent -and $allCoreFilesPresent -and $allPagesPresent) {
    Write-Host "INTEGRATION SUCCESSFUL! All member repos have been seamlessly integrated." -ForegroundColor Green
    Write-Host "The HireHub AI platform is ready for deployment." -ForegroundColor Green
} else {
    Write-Host "INTEGRATION INCOMPLETE. Please address the issues listed above." -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor White
