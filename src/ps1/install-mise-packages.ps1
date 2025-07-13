# Install packages using mise
param(
    [string]$Packages = ""
)

# Use environment variable if parameter not provided
if ([string]::IsNullOrWhiteSpace($Packages)) {
    $Packages = $env:MISE_PACKAGES
}

if ([string]::IsNullOrWhiteSpace($Packages)) {
    Write-Host "No mise packages specified, skipping..."
    return
}

Write-Host "Installing packages with mise..."

# Split packages by comma and install each
$packageList = $Packages -split ','
foreach ($package in $packageList) {
    $package = $package.Trim()
    if (![string]::IsNullOrWhiteSpace($package)) {
        Write-Host "Installing mise package: $package"
        try {
            mise use -g $package
            Write-Host "Successfully installed: $package"
        }
        catch {
            Write-Host "Failed to install $package`: $_" -ForegroundColor Red
        }
    }
}

Write-Host "mise package installation completed."