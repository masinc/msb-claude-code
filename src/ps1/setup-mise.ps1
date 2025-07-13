# Setup mise
Write-Host "Setting up mise..."

# Set execution policy to allow profile scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Add mise activation to PowerShell profile
$profilePath = $PROFILE.CurrentUserAllHosts
if (!(Test-Path -Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force | Out-Null
}

$miseActivation = 'Invoke-Expression (&mise activate powershell)'
$currentContent = Get-Content $profilePath -ErrorAction SilentlyContinue
if ($currentContent -notcontains $miseActivation) {
    Add-Content -Path $profilePath -Value $miseActivation
    Write-Host "Added mise activation to PowerShell profile"
}

# Activate mise for current session
Invoke-Expression (&mise activate powershell)

Write-Host "mise setup completed."