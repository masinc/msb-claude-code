# Progress Management System for Windows Sandbox Initialization
# Manages progress state and updates progress JSON file

$ProgressFile = "C:\init-progress.json"
$LogMessages = @()

# Global progress state
$Global:ProgressState = @{
    totalSteps = 0
    currentStep = 0
    currentStepName = ""
    logs = @()
    completed = $false
    error = $null
}

function Initialize-Progress {
    param(
        [int]$TotalSteps
    )
    
    $Global:ProgressState.totalSteps = $TotalSteps
    $Global:ProgressState.currentStep = 0
    $Global:ProgressState.currentStepName = "Starting initialization..."
    $Global:ProgressState.logs = @()
    $Global:ProgressState.completed = $false
    $Global:ProgressState.error = $null
    
    Save-ProgressState
    Add-ProgressLog "Initialization started with $TotalSteps steps"
}

function Update-ProgressStep {
    param(
        [string]$StepName,
        [string]$LogMessage = $null
    )
    
    $Global:ProgressState.currentStep++
    $Global:ProgressState.currentStepName = $StepName
    
    if ($LogMessage) {
        Add-ProgressLog $LogMessage
    }
    
    Save-ProgressState
    
    Write-Host "[$($Global:ProgressState.currentStep)/$($Global:ProgressState.totalSteps)] $StepName"
}

function Add-ProgressLog {
    param(
        [string]$Message
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    
    $Global:ProgressState.logs += $logEntry
    
    # Keep only last 50 log entries to prevent GUI overload
    if ($Global:ProgressState.logs.Count -gt 50) {
        $Global:ProgressState.logs = $Global:ProgressState.logs[-50..-1]
    }
    
    Save-ProgressState
}

function Set-ProgressError {
    param(
        [string]$ErrorMessage
    )
    
    $Global:ProgressState.error = $ErrorMessage
    Add-ProgressLog "ERROR: $ErrorMessage"
    Save-ProgressState
}

function Complete-Progress {
    param(
        [string]$Message = "Initialization completed successfully!"
    )
    
    $Global:ProgressState.completed = $true
    $Global:ProgressState.currentStepName = $Message
    Add-ProgressLog $Message
    Save-ProgressState
}

function Save-ProgressState {
    try {
        $json = $Global:ProgressState | ConvertTo-Json -Depth 3
        $json | Out-File -FilePath $ProgressFile -Encoding UTF8 -Force
    } catch {
        Write-Warning "Failed to save progress state: $($_.Exception.Message)"
    }
}

function Get-ProgressState {
    if (Test-Path $ProgressFile) {
        try {
            return Get-Content $ProgressFile -Raw | ConvertFrom-Json
        } catch {
            Write-Warning "Failed to read progress state: $($_.Exception.Message)"
        }
    }
    return $null
}

function Start-ProgressGUI {
    try {
        # Start the GUI in a separate process
        $guiScript = "C:\init\progress-gui.ps1"
        if (Test-Path $guiScript) {
            Start-Process -FilePath "powershell.exe" -ArgumentList "-WindowStyle Hidden", "-ExecutionPolicy Bypass", "-File `"$guiScript`"" -PassThru
            Add-ProgressLog "Progress GUI started"
        } else {
            Write-Warning "Progress GUI script not found: $guiScript"
        }
    } catch {
        Write-Warning "Failed to start progress GUI: $($_.Exception.Message)"
    }
}

function Stop-ProgressGUI {
    try {
        # Mark as completed to trigger GUI auto-close
        Complete-Progress
        Add-ProgressLog "Progress GUI will close automatically"
    } catch {
        Write-Warning "Failed to stop progress GUI: $($_.Exception.Message)"
    }
}

# Helper function to wrap script execution with progress tracking
function Invoke-ProgressStep {
    param(
        [string]$StepName,
        [scriptblock]$ScriptBlock,
        [string]$LogMessage = $null
    )
    
    try {
        Update-ProgressStep -StepName $StepName -LogMessage $LogMessage
        
        # Execute the script block
        & $ScriptBlock
        
        Add-ProgressLog "$StepName completed successfully"
    } catch {
        $errorMsg = "Failed to execute $StepName : $($_.Exception.Message)"
        Set-ProgressError $errorMsg
        throw $_
    }
}

# Export functions for use in other scripts
Export-ModuleMember -Function Initialize-Progress, Update-ProgressStep, Add-ProgressLog, Set-ProgressError, Complete-Progress, Start-ProgressGUI, Stop-ProgressGUI, Invoke-ProgressStep