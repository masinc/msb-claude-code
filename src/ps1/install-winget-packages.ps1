# Install packages using WinGet by ID
param(
    [string]$PackageIds = ""
)

# Use environment variable if parameter not provided
if ([string]::IsNullOrWhiteSpace($PackageIds)) {
    $PackageIds = $env:WINGET_PACKAGE_IDS
}

if ([string]::IsNullOrWhiteSpace($PackageIds)) {
    Write-Host "No WinGet package IDs specified, skipping..."
    return
}

Write-Host "Installing packages with WinGet..."

# Split package IDs by comma and install each
$packageList = $PackageIds -split ','
foreach ($packageId in $packageList) {
    $packageId = $packageId.Trim()
    if (![string]::IsNullOrWhiteSpace($packageId)) {
        Write-Host "Installing WinGet package: $packageId"
        try {
            Install-WinGetPackage -Id $packageId -Source winget -Force
            Write-Host "Successfully installed: $packageId"
        }
        catch {
            Write-Host "Failed to install $packageId`: $_" -ForegroundColor Red
        }
    }
}

Write-Host "WinGet package installation completed."