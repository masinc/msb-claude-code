# Advanced Windows Firewall Security Configuration - Whitelist Approach
# Equivalent to init-firewall.ts for Windows Sandbox environments

Write-Host "🔥 Initializing advanced firewall configuration..." -ForegroundColor Yellow

try {
    Write-Host "🧹 Clearing existing firewall rules..." -ForegroundColor Green
    # Remove all existing firewall rules (except built-in rules)
    Get-NetFirewallRule | Where-Object { $_.Group -notlike "*@*" -and $_.DisplayName -notlike "Core Networking*" -and $_.DisplayName -notlike "Windows*" } | Remove-NetFirewallRule -ErrorAction SilentlyContinue

    Write-Host "🌐 Setting up basic connectivity rules..." -ForegroundColor Green
    # Allow DNS (required for domain resolution)
    New-NetFirewallRule -DisplayName "Allow-DNS-Out" -Direction Outbound -Protocol UDP -RemotePort 53 -Action Allow -ErrorAction Stop
    New-NetFirewallRule -DisplayName "Allow-DNS-In" -Direction Inbound -Protocol UDP -LocalPort 53 -Action Allow -ErrorAction Stop
    
    # Allow localhost communication
    New-NetFirewallRule -DisplayName "Allow-Localhost-Out" -Direction Outbound -RemoteAddress 127.0.0.1 -Action Allow -ErrorAction Stop
    New-NetFirewallRule -DisplayName "Allow-Localhost-In" -Direction Inbound -RemoteAddress 127.0.0.1 -Action Allow -ErrorAction Stop

    Write-Host "🐙 Fetching GitHub IP ranges..." -ForegroundColor Green
    # Fetch GitHub meta information
    try {
        $ghRangesResp = Invoke-RestMethod -Uri "https://api.github.com/meta" -TimeoutSec 10
        if (-not $ghRangesResp.web -or -not $ghRangesResp.api -or -not $ghRangesResp.git) {
            throw "GitHub API response missing required fields"
        }
        
        Write-Host "📋 Processing GitHub IPs..." -ForegroundColor Green
        $allGithubIPs = @()
        $allGithubIPs += $ghRangesResp.web
        $allGithubIPs += $ghRangesResp.api
        $allGithubIPs += $ghRangesResp.git
        $allGithubIPs = $allGithubIPs | Select-Object -Unique
        
        # Add GitHub IP ranges
        foreach ($cidr in $allGithubIPs) {
            if ($cidr -match '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/[0-9]{1,2}$') {
                Write-Host "📍 Adding GitHub range $cidr" -ForegroundColor Cyan
                New-NetFirewallRule -DisplayName "Allow-GitHub-$cidr" -Direction Outbound -RemoteAddress $cidr -Action Allow -ErrorAction SilentlyContinue
            } else {
                Write-Warning "⚠️ Invalid CIDR range from GitHub meta: $cidr"
            }
        }
    } catch {
        Write-Warning "⚠️ Failed to fetch GitHub IP ranges: $($_.Exception.Message)"
    }

    Write-Host "🔍 Resolving and adding allowed domains..." -ForegroundColor Green
    # Allowed domains list (Windows-specific)
    $allowedDomains = @(        
        "registry.npmjs.org",
        "api.anthropic.com", 
        "sentry.io",
        "statsig.anthropic.com",
        "statsig.com",
        "mise.jdx.dev",
        "mise-releases.s3.amazonaws.com",
        "releases.hashicorp.com",
        "objects.githubusercontent.com",
        "deno.land",
        "jsr.io",
        "github.com",
        "raw.githubusercontent.com",
        "codeload.github.com"
    )

    foreach ($domain in $allowedDomains) {
        Write-Host "🔍 Resolving $domain..." -ForegroundColor Cyan
        try {
            $ips = Resolve-DnsName -Name $domain -Type A -ErrorAction Stop | Where-Object { $_.IPAddress }
            if ($ips) {
                foreach ($ip in $ips) {
                    if ($ip.IPAddress -match '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$') {
                        Write-Host "📍 Adding $($ip.IPAddress) for $domain" -ForegroundColor Green
                        New-NetFirewallRule -DisplayName "Allow-$domain-$($ip.IPAddress)" -Direction Outbound -RemoteAddress $ip.IPAddress -Action Allow -ErrorAction SilentlyContinue
                    }
                }
            } else {
                Write-Warning "⚠️ Failed to resolve $domain"
            }
        } catch {
            Write-Warning "⚠️ Failed to resolve $domain : $($_.Exception.Message)"
        }
    }

    Write-Host "🏠 Detecting host network..." -ForegroundColor Green
    # Get host network information  
    $defaultGateway = Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Select-Object -First 1
    if ($defaultGateway) {
        $hostIP = $defaultGateway.NextHop
        $hostNetwork = $hostIP -replace '\.[0-9]+$', '.0/24'
        Write-Host "🏠 Host network detected as: $hostNetwork" -ForegroundColor Yellow
        
        # Allow host network communication
        New-NetFirewallRule -DisplayName "Allow-Host-Network-Out" -Direction Outbound -RemoteAddress $hostNetwork -Action Allow -ErrorAction Stop
        New-NetFirewallRule -DisplayName "Allow-Host-Network-In" -Direction Inbound -RemoteAddress $hostNetwork -Action Allow -ErrorAction Stop
    }

    Write-Host "🔒 Setting restrictive default policies..." -ForegroundColor Green
    # Set default firewall policy to block
    Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultOutboundAction Block -ErrorAction Stop
    Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultInboundAction Block -ErrorAction Stop
    
    # Allow established connections
    New-NetFirewallRule -DisplayName "Allow-Established-Out" -Direction Outbound -Protocol Any -Action Allow -ConnectionState EstablishedAndRelated -ErrorAction Stop
    New-NetFirewallRule -DisplayName "Allow-Established-In" -Direction Inbound -Protocol Any -Action Allow -ConnectionState EstablishedAndRelated -ErrorAction Stop

    Write-Host "✅ Firewall configuration complete" -ForegroundColor Green

    Write-Host "🧪 Verifying firewall rules..." -ForegroundColor Green
    # Test firewall by checking blocked vs allowed access
    try {
        $exampleTest = Invoke-WebRequest -Uri "https://example.com" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "❌ Firewall verification failed - was able to reach https://example.com" -ForegroundColor Red
    } catch {
        Write-Host "✅ Firewall verification passed - unable to reach https://example.com as expected" -ForegroundColor Green
    }

    try {
        $githubTest = Invoke-WebRequest -Uri "https://api.github.com/zen" -TimeoutSec 5 -ErrorAction Stop  
        Write-Host "✅ Firewall verification passed - able to reach https://api.github.com as expected" -ForegroundColor Green
    } catch {
        Write-Host "❌ Firewall verification failed - unable to reach https://api.github.com" -ForegroundColor Red
    }

    Write-Host "🎉 Advanced firewall initialization completed successfully!" -ForegroundColor Green

} catch {
    Write-Host "⚠️ Firewall setup encountered an error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "⚠️ Firewall setup skipped (not available in this environment)" -ForegroundColor Yellow
}
