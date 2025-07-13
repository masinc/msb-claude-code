function Invoke-Notification {
    param(
        [string]$Message = "Initialization completed successfully!",
        [string]$Title = "Windows Sandbox"
    )

    Write-Host $Message

    # Show notification
    Add-Type -AssemblyName System.Windows.Forms
    $notification = New-Object System.Windows.Forms.NotifyIcon
    $notification.Icon = [System.Drawing.SystemIcons]::Information
    $notification.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
    $notification.BalloonTipText = $Message
    $notification.BalloonTipTitle = $Title
    $notification.Visible = $true
    $notification.ShowBalloonTip(5000)

    Write-Host "Ready to use the sandbox environment."
}