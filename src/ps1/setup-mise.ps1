# Setup mise
Write-Host "Setting up mise..."

# Set execution policy to allow profile scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Add mise activation to PowerShell profile (using official method)
$profilePath = "C:\Users\WDAGUtilityAccount\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
$profileDir = Split-Path -Path $profilePath -Parent

# Create profile directory if it doesn't exist
if (!(Test-Path -Path $profileDir)) {
    New-Item -Path $profileDir -ItemType Directory -Force | Out-Null
}

# Create profile file if it doesn't exist
if (!(Test-Path -Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force | Out-Null
}

$miseActivation = 'mise activate pwsh | Out-String | Invoke-Expression'
$currentContent = Get-Content $profilePath -ErrorAction SilentlyContinue
if ($currentContent -notcontains $miseActivation) {
    Add-Content -Path $profilePath -Value $miseActivation
    Write-Host "Added mise activation to PowerShell profile"
}

# Activate mise for current session
mise activate pwsh | Out-String | Invoke-Expression

Write-Host "mise setup completed."