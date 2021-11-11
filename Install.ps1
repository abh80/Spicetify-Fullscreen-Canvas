param($mtoken)

Write-Output "Downloading File..."
Write-Output ""

if (![bool](Get-Command spicetify -errorAction SilentlyContinue)) {
    Write-Output "Spicetify not found!"
    $answer = Read-Host -Prompt "Install Spicetify? (y/n) "
    if ($answer -eq "y") {
        Write-Output "Installing Spicetify..."
    
        Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/khanhas/spicetify-cli/master/install.ps1" | Invoke-Expression

    }
    else {
        Write-Output "Exiting..."
        exit 0
    }
}

if (Test-Path $env:USERPROFILE\.spicetify\Extensions\spotifyFullscreenCanvas.js) {
    Remove-Item $env:USERPROFILE\.spicetify\Extensions\spotifyFullscreenCanvas.js -Force -Recurse -ErrorAction SilentlyContinue
} 

Invoke-WebRequest https://raw.githubusercontent.com/abh80/Spicetify-Fullscreen-Canvas/main/spotifyFullscreenCanvas.js -OutFile $env:USERPROFILE\.spicetify\Extensions\spotifyFullscreenCanvas.js

if ($mtoken){
    Add-Content $env:USERPROFILE\.spicetify\Extensions\spotifyFullscreenCanvas.js "var TOKEN = '$mtoken';"
}
Invoke-Expression "spicetify config extensions spotifyFullscreenCanvas.js"
Invoke-Expression "spicetify apply"

Write-Output ""
Write-Output "Done!"
$answer = Read-Host -Prompt "Remove Ads? (y/N) "
if ($answer -eq "y") {
    Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/mrpond/BlockTheSpot/master/install.ps1' | Invoke-Expression
}
Write-Output ""
Write-Output "Thanks for installing Spicetify Fullscreen Canvas!"
