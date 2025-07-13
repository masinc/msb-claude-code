# Windows Forms Progress GUI for Windows Sandbox Initialization
# Displays real-time progress of initialization steps

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Constants
$ProgressFile = "C:\init-progress.json"
$LogFile = "C:\init.log"

# Global variables
$form = $null
$progressBar = $null
$stepLabel = $null
$logTextBox = $null
$watcher = $null

function Initialize-ProgressGUI {
    # Create main form
    $script:form = New-Object System.Windows.Forms.Form
    $script:form.Text = "Windows Sandbox Initialization"
    $script:form.Size = New-Object System.Drawing.Size(500, 350)
    $script:form.StartPosition = "CenterScreen"
    $script:form.FormBorderStyle = "FixedDialog"
    $script:form.MaximizeBox = $false
    $script:form.MinimizeBox = $true
    $script:form.ShowInTaskbar = $true
    $script:form.TopMost = $true

    # Progress bar
    $script:progressBar = New-Object System.Windows.Forms.ProgressBar
    $script:progressBar.Location = New-Object System.Drawing.Point(20, 20)
    $script:progressBar.Size = New-Object System.Drawing.Size(440, 25)
    $script:progressBar.Style = "Continuous"
    $script:progressBar.Minimum = 0
    $script:progressBar.Maximum = 100
    $script:form.Controls.Add($script:progressBar)

    # Step label
    $script:stepLabel = New-Object System.Windows.Forms.Label
    $script:stepLabel.Location = New-Object System.Drawing.Point(20, 55)
    $script:stepLabel.Size = New-Object System.Drawing.Size(440, 20)
    $script:stepLabel.Text = "Initializing..."
    $script:stepLabel.Font = New-Object System.Drawing.Font("Microsoft Sans Serif", 9, [System.Drawing.FontStyle]::Bold)
    $script:form.Controls.Add($script:stepLabel)

    # Log text box
    $script:logTextBox = New-Object System.Windows.Forms.TextBox
    $script:logTextBox.Location = New-Object System.Drawing.Point(20, 85)
    $script:logTextBox.Size = New-Object System.Drawing.Size(440, 220)
    $script:logTextBox.Multiline = $true
    $script:logTextBox.ScrollBars = "Vertical"
    $script:logTextBox.ReadOnly = $true
    $script:logTextBox.BackColor = [System.Drawing.Color]::Black
    $script:logTextBox.ForeColor = [System.Drawing.Color]::LimeGreen
    $script:logTextBox.Font = New-Object System.Drawing.Font("Consolas", 8)
    $script:form.Controls.Add($script:logTextBox)

    # Set up file system watcher for progress file
    $script:watcher = New-Object System.IO.FileSystemWatcher
    $script:watcher.Path = "C:\"
    $script:watcher.Filter = "init-progress.json"
    $script:watcher.IncludeSubdirectories = $false
    $script:watcher.EnableRaisingEvents = $true

    # Event handler for file changes
    Register-ObjectEvent -InputObject $script:watcher -EventName "Changed" -Action {
        try {
            Start-Sleep -Milliseconds 100  # Avoid file access conflicts
            if (Test-Path $ProgressFile) {
                $progressData = Get-Content $ProgressFile -Raw | ConvertFrom-Json
                
                # Update GUI on main thread
                $script:form.Invoke([Action]{
                    Update-ProgressDisplay -ProgressData $progressData
                })
            }
        } catch {
            # Ignore file access errors during rapid updates
        }
    } | Out-Null

    # Initial load if progress file exists
    if (Test-Path $ProgressFile) {
        try {
            $progressData = Get-Content $ProgressFile -Raw | ConvertFrom-Json
            Update-ProgressDisplay -ProgressData $progressData
        } catch {
            # Ignore initial load errors
        }
    }

    # Form closing event
    $script:form.Add_FormClosing({
        if ($script:watcher) {
            $script:watcher.EnableRaisingEvents = $false
            $script:watcher.Dispose()
        }
    })

    Write-Host "Progress GUI initialized"
}

function Update-ProgressDisplay {
    param([object]$ProgressData)
    
    try {
        if ($ProgressData) {
            # Update progress bar
            $percentage = [math]::Round(($ProgressData.currentStep / $ProgressData.totalSteps) * 100)
            $script:progressBar.Value = [math]::Min($percentage, 100)
            
            # Update step label
            $stepText = "$($ProgressData.currentStepName) ($($ProgressData.currentStep)/$($ProgressData.totalSteps)) - $percentage%"
            $script:stepLabel.Text = $stepText
            
            # Update log if new messages exist
            if ($ProgressData.logs -and $ProgressData.logs.Count -gt 0) {
                $newLogs = $ProgressData.logs -join "`r`n"
                if ($script:logTextBox.Text -ne $newLogs) {
                    $script:logTextBox.Text = $newLogs
                    $script:logTextBox.SelectionStart = $script:logTextBox.Text.Length
                    $script:logTextBox.ScrollToCaret()
                }
            }
            
            # Check if completed
            if ($ProgressData.completed) {
                $script:stepLabel.Text = "Initialization completed successfully!"
                $script:progressBar.Value = 100
                
                # Auto-close after 3 seconds
                $timer = New-Object System.Windows.Forms.Timer
                $timer.Interval = 3000
                $timer.Add_Tick({
                    $timer.Stop()
                    $script:form.Close()
                })
                $timer.Start()
            }
        }
    } catch {
        Write-Host "Error updating progress display: $($_.Exception.Message)"
    }
}

function Show-ProgressGUI {
    try {
        Initialize-ProgressGUI
        
        # Show the form
        $script:form.Add_Shown({
            $script:form.Activate()
        })
        
        [System.Windows.Forms.Application]::Run($script:form)
    } catch {
        Write-Host "Error showing progress GUI: $($_.Exception.Message)"
    }
}

# Start the GUI (always run when this script is executed)
Show-ProgressGUI