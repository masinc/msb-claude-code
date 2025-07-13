# Refresh environment variables and PATH for current PowerShell session
function Refresh-Environment {
    Write-Host "Refreshing environment variables..."
    
    # Get system and user PATH variables
    $machinePath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
    
    # Combine and update current session PATH
    $env:PATH = "$machinePath;$userPath"
    
    # Add Scoop shims directory if it exists
    $scoopShims = "$env:USERPROFILE\scoop\shims"
    if (Test-Path $scoopShims) {
        $env:PATH = "$scoopShims;$env:PATH"
        Write-Host "Added Scoop shims to PATH: $scoopShims"
    }
    
    Write-Host "Environment variables refreshed."
}