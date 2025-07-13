# Install packages using Scoop
Write-Host "Installing packages with Scoop..."

# Add commonly used buckets
scoop bucket add extras
scoop bucket add main

# Install development tools
scoop install ripgrep
scoop install fd
scoop install mise

Write-Host "Scoop package installation completed."
