# Install packages using Scoop
param(
    [string]$Packages = ""
)

Write-Host "Installing packages with Scoop..."

# Add commonly used buckets
scoop bucket add extras
scoop bucket add main

# Install default development tools
scoop install ripgrep
scoop install fd
scoop install mise

# Use environment variable if parameter not provided
if ([string]::IsNullOrWhiteSpace($Packages)) {
    $Packages = $env:SCOOP_PACKAGES
}

# Install additional packages if specified
if (![string]::IsNullOrWhiteSpace($Packages)) {
    Write-Host "Installing additional scoop packages..."
    $packageList = $Packages -split ','
    foreach ($package in $packageList) {
        $package = $package.Trim()
        if (![string]::IsNullOrWhiteSpace($package)) {
            Write-Host "Installing scoop package: $package"
            try {
                scoop install $package
                Write-Host "Successfully installed: $package"
            }
            catch {
                Write-Host "Failed to install $package`: $_" -ForegroundColor Red
            }
        }
    }
}

# Refresh environment variables
. "C:\init\refresh-environment.ps1"
Refresh-Environment

Write-Host "Scoop package installation completed."
