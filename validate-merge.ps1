# Validation script for final HireHub AI project
Write-Host "Validating HireHub AI Final Merge..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check core files
$coreFiles = @(
    "src\App.jsx",
    "src\index.jsx", 
    "src\Routes.jsx",
    "package.json",
    "vite.config.mjs",
    "jsconfig.json",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html"
)

Write-Host "`nChecking core files:" -ForegroundColor Yellow
$allCoreFilesExist = $true
foreach ($file in $coreFiles) {
    $path = "E:\hirehub\hirehub_ai-final\$file"
    if (Test-Path $path) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file" -ForegroundColor Red
        $allCoreFilesExist = $false
    }
}

# Check page directories
$pageDirectories = @(
    # Project A
    "src\pages\homepage",
    "src\pages\authentication-login-register",
    "src\pages\about-contact-page",
    "src\pages\notifications-center",
    "src\pages\profile-management",
    "src\pages\video-interview-interface",
    
    # Project B
    "src\pages\job-seeker-onboarding-wizard",
    "src\pages\job-detail-view",
    "src\pages\ai-powered-job-feed-dashboard",
    "src\pages\team-management-dashboard",
    "src\pages\ai-resume-builder",
    "src\pages\recruiter-employer-onboarding-wizard",
    
    # Project C
    "src\pages\course-detail-learning-interface",
    "src\pages\ai-career-coach-chat-interface",
    "src\pages\recruiter-dashboard-pipeline-management",
    "src\pages\candidate-profile-evaluation-interface",
    "src\pages\job-search-application-hub",
    "src\pages\admin-dashboard-system-management",
    
    # Project D
    "src\pages\interview-practice-video-sessions",
    "src\pages\mentorship-platform",
    "src\pages\resource-library",
    "src\pages\alumni-network-referrals",
    "src\pages\virtual-career-fair",
    "src\pages\hackathons-competitions",
    
    # Not Found page
    "src\pages\NotFound.jsx"
)

Write-Host "`nChecking page directories:" -ForegroundColor Yellow
$allPagesExist = $true
foreach ($dir in $pageDirectories) {
    $path = "E:\hirehub\hirehub_ai-final\$dir"
    if (Test-Path $path) {
        Write-Host "  ✓ $dir" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $dir" -ForegroundColor Red
        $allPagesExist = $false
    }
}

# Check UI components
$uiComponents = @(
    "src\components\ui\Button.jsx",
    "src\components\ui\Header.jsx",
    "src\components\ui\Input.jsx",
    "src\components\AppIcon.jsx",
    "src\components\AppImage.jsx",
    "src\components\ErrorBoundary.jsx",
    "src\components\ScrollToTop.jsx"
)

Write-Host "`nChecking UI components:" -ForegroundColor Yellow
$allComponentsExist = $true
foreach ($comp in $uiComponents) {
    $path = "E:\hirehub\hirehub_ai-final\$comp"
    if (Test-Path $path) {
        Write-Host "  ✓ $comp" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $comp" -ForegroundColor Red
        $allComponentsExist = $false
    }
}

# Check styles
$styleFiles = @(
    "src\styles\index.css",
    "src\styles\tailwind.css"
)

Write-Host "`nChecking style files:" -ForegroundColor Yellow
$allStylesExist = $true
foreach ($style in $styleFiles) {
    $path = "E:\hirehub\hirehub_ai-final\$style"
    if (Test-Path $path) {
        Write-Host "  ✓ $style" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $style" -ForegroundColor Red
        $allStylesExist = $false
    }
}

# Check utility files
$utilFiles = @(
    "src\utils\cn.js"
)

Write-Host "`nChecking utility files:" -ForegroundColor Yellow
$allUtilsExist = $true
foreach ($util in $utilFiles) {
    $path = "E:\hirehub\hirehub_ai-final\$util"
    if (Test-Path $path) {
        Write-Host "  ✓ $util" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $util" -ForegroundColor Red
        $allUtilsExist = $false
    }
}
    $path = "E:\hirehub\hirehub_ai-final\$util"
    if (Test-Path $path) {
        Write-Host "  ✓ $util" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $util" -ForegroundColor Red
        $allUtilsExist = $false
    }
}

# Final validation results
Write-Host "`nValidation Results:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

if ($allCoreFilesExist -and $allPagesExist -and $allComponentsExist -and $allStylesExist -and $allUtilsExist) {
    Write-Host "✓ All required files and directories are present in the final project!" -ForegroundColor Green
} else {
    Write-Host "✗ Some required files or directories are missing. See details above." -ForegroundColor Red
}

# Report counts
$pageCount = (Get-ChildItem -Path "E:\hirehub\hirehub_ai-final\src\pages" -Directory | Measure-Object).Count
$componentCount = (Get-ChildItem -Path "E:\hirehub\hirehub_ai-final\src\components\ui" -File | Measure-Object).Count
$totalJsxCount = (Get-ChildItem -Path "E:\hirehub\hirehub_ai-final\src" -Recurse -Include "*.jsx" | Measure-Object).Count

Write-Host "`nCounts:" -ForegroundColor Yellow
Write-Host "  • Page directories: $pageCount" -ForegroundColor White
Write-Host "  • UI components: $componentCount" -ForegroundColor White
Write-Host "  • Total JSX files: $totalJsxCount" -ForegroundColor White
