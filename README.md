# Spicetify-Fullscreen-Canvas
A spicetify extension to replicate the console version of spotify fullscreen. Fork of https://github.com/khanhas/spicetify-cli/blob/master/Extensions/fullAppDisplay.js. Scroll to [Previews](#previews) to see preview.

# Automatic Installation (Windows Only)
- Open Powershell
- and run `Invoke-Webrequest https://raw.githubusercontent.com/abh80/Spicetify-Fullscreen-Canvas/main/Install.ps1 | Invoke-Expression`
- Enjoy the extension! :)

# Manual Installtion
- Make sure you have Spicetify CLI install. [Learn More](https://github.com/khanhas/spicetify-cli)
- To install save the file [spotifyFullscreenCanvas.js](https://github.com/abh80/Spicetify-Fullscreen-Canvas/blob/main/spotifyFullscreenCanvas.js)
- For Windows user navigate to `%userprofile%\.spicetify\Extensions\` and for Linux / MacOS users navigate to `~/.config/spicetify/Extensions` and paste the downloaded file there.
- Now run `spicetify config extensions spotifyFullscreenCanvas.js`
- and run `spicetify apply` and enjoy the extension!


# Previews
![image](https://user-images.githubusercontent.com/50198413/141055119-22e98f1f-645d-4ee3-a24d-b4192a0a8eef.png)
![image](https://user-images.githubusercontent.com/50198413/140872897-7b944ac1-40ba-49f9-b541-5650ef109fb1.png)
![image](https://user-images.githubusercontent.com/50198413/141737822-defe4ca8-791a-4ba4-923e-950f2c551807.png)

# Lyrics Info
To enable lyrics we need to configure it during installation.

- Firstly open up the powershell
- now save the script by running `Invoke-Webrequest https://raw.githubusercontent.com/abh80/Spicetify-Fullscreen-Canvas/main/Install.ps1 -Outfile install.ps1`
- atlast run the run the script `./install.ps1 -mtoken <your musixmatch token here` ([learn how to get musixmatch token here](https://github.com/khanhas/genius-spicetify/#musicxmatch))
- Optional! remove the script as its no longer needed `Remove-Item install.ps1`


# Usage 
- To go fullscreen either click the double arrow in the top left or press f11
- To exit fullscreen either double click anywhere or press f11
- Right Click on fullscreen to access settings.
