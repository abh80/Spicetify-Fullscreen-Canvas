Write-Output "Downloading File..."
Invoke-WebRequest https://raw.githubusercontent.com/abh80/Spicetify-Fullscreen-Canvas/main/spotifyFullscreenCanvas.js -OutFile $env:USERPROFILE\.spicetify\Extensions\spotifyFullscreenCanvas.js

if (Get-Command spicetify -errorAction SilentlyContinue)
{
 Invoke-Expression "spicetify config extensions spotifyFullscreenCanvas.js"
 Invoke-Expression "spicetify apply"
}
else {

    Write-Output "Spicetify not found!"
    $answer = Read-Host -Prompt "Install Spicetify? (y/n)"
    if ($answer -eq "y") {
        Write-Output "Installing Spicetify..."
    
        Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/khanhas/spicetify-cli/master/install.ps1" | Invoke-Expression

    } else {
        Write-Output "Exiting..."
        exit 0
    }
}

