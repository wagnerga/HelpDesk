# ================================
# HelpDesk IIS Setup Script
# ================================

# --- Define paths and settings ---
$pfxPath     = "C:\HelpDesk\HelpDeskWeb\Certificates\cert.pfx"
$sitePath    = "C:\HelpDesk\HelpDeskWeb\HelpDeskUI\build"
$siteName    = "HelpDeskUI"
$port        = 7000
$certStore   = "cert:\LocalMachine\My"
$ruleName    = "IIS HTTPS $port"
$ipport      = "0.0.0.0:$port"
$appcmd      = "$env:windir\system32\inetsrv\appcmd.exe"

Write-Host "`n=== HelpDesk IIS Setup ===`n"

# --- Step 1: Import certificate ---
Write-Host "Checking for existing certificate..."
$pfxCert = Get-PfxCertificate -FilePath $pfxPath
$existingCert = Get-ChildItem -Path $certStore | Where-Object { $_.Thumbprint -eq $pfxCert.Thumbprint }

if ($existingCert) {
    Write-Host "Removing existing certificate..."
    Remove-Item -Path $existingCert.PSPath -Force
}

Write-Host "Importing new certificate..."
Import-PfxCertificate -FilePath $pfxPath -CertStoreLocation $certStore
$cert = Get-ChildItem -Path $certStore | Where-Object { $_.Thumbprint -eq $pfxCert.Thumbprint }

Write-Host "Adding certificate to Trusted Root Certification Authorities..."
Import-PfxCertificate -FilePath $pfxPath -CertStoreLocation "cert:\LocalMachine\Root"

# --- Step 2: Bind certificate to port ---
$thumbprint = $cert.Thumbprint.Replace(" ", "")
$bindingExists = netsh http show sslcert | Select-String $ipport

if ($bindingExists) {
    Write-Host "Removing existing SSL binding for port $port..."
    Start-Process -FilePath "netsh.exe" -ArgumentList "http delete sslcert ipport=$ipport" -Wait -NoNewWindow
}

Write-Host "Binding certificate to port $port..."
$guid = [guid]::NewGuid().ToString()
Start-Process -FilePath "netsh.exe" -ArgumentList "http add sslcert ipport=$ipport certhash=$thumbprint appid={$guid}" -Wait -NoNewWindow

# --- Step 3: Create IIS site ---
Import-Module WebAdministration

if (-not (Get-Website -Name $siteName -ErrorAction SilentlyContinue)) {
    Write-Host "Creating IIS site '$siteName'..."
    New-Item "IIS:\Sites\$siteName" -bindings @{protocol="https";bindingInformation="*:${port}:"} -physicalPath $sitePath
} else {
    Write-Host "Site '$siteName' already exists."
}

# --- Step 4: Create firewall rule ---
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if (-not $existingRule) {
    Write-Host "Creating firewall rule for port $port..."
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow
} else {
    Write-Host "Firewall rule already exists."
}

# --- Step 5: Ensure IIS service is running ---
$w3svc = Get-Service -Name W3SVC -ErrorAction SilentlyContinue
if ($w3svc.Status -ne 'Running') {
    Write-Host "Starting IIS service..."
    try {
        Start-Service -Name W3SVC
        Write-Host "IIS service started."
    } catch {
        Write-Host "ERROR: Failed to start IIS service."
        Write-Host $_.Exception.Message
        exit 1
    }
} else {
    Write-Host "IIS service is already running."
}

# --- Step 6: Start site ---
Write-Host "Starting IIS site '$siteName'..."
Start-Website -Name $siteName

# --- Step 7: Verify site ---
Write-Host "Verifying site availability..."
try {
    $response = Invoke-WebRequest -Uri "https://localhost:$port" -UseBasicParsing
    Write-Host "Site responded with status code:" $response.StatusCode
} catch {
    Write-Host "Site verification failed:"
    Write-Host $_.Exception.Message
}

Write-Host "`n=== Setup Complete ===`n"