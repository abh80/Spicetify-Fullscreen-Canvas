// @ts-check
// NAME: Spotify FullScreen Canvas
// AUTHOR: abh80 originally khanhas
// VERSION: 1.5
// DESCRIPTION: Fancy artwork and track status display.

/// <reference path="./global.d.ts" />

(function FullAppDisplay() {
  if (!Spicetify.Keyboard) {
    setTimeout(FullAppDisplay, 200);
    return;
  }
  const version = "1.0";
  let shouldProgressUpdate = true;
  async function checkForUpdate() {
    const releasesLink =
      "https://api.github.com/repos/abh80/Spicetify-Fullscreen-Canvas/releases";
    const response = await fetch(releasesLink);
    const releases = await response.json();
    const latestRelease = releases[0];
    const latestVersion = latestRelease.tag_name;
    if (parseFloat(version) < parseFloat(latestVersion)) {
      Spicetify.showNotification(
        "An update is available for Spicetify Fullscreen Canvas!"
      );
      document.querySelector(".main-topBar-historyButtons").innerHTML +=
        "<a href=" +
        `"https://github.com/abh80/Spicetify-Fullscreen-Canvas/releases/${latestVersion}">Update!</a>`;
    }
  }
  checkForUpdate();
  const CONFIG = getConfig();

  const style = document.createElement("style");
  let mouseHandler = null;

  const styleBase = `
#full-app-display {
    display: block;
    position: fixed;
    width: 100%;
    height: 100%;
    cursor: default;
    left: 0;
    top: 0;
    opacity: 0;
    transition : opacity 0.5s ease-in-out;
}
#fad-header {
    position: fixed;
    width: 100%;
    height: 80px;
    -webkit-app-region: drag;
}
#fad-foreground {
    left: 0;
    width: 100%;
    align-items: center;
    justify-content: center;
}

#fad-art-image {
    position: relative;
    width: 100%;
    height: 100%;
    padding-bottom: 100%;
    border-radius: 15px;
    background-size: cover;
}
#fad-art-inner {
    position: absolute;
    left: 3%;
    bottom: 0;
    width: 94%;
    height: 94%;
    z-index: -1;
    backface-visibility: hidden;
    transform: translateZ(0);
    filter: blur(6px);
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}
#fad-progress-container {
    width: 100%;
    display: flex;
    align-items: center;
}
#fad-progress {
    width: 100%;
    height: 6px;
    border-radius: 6px;
    background-color: #ffffff50;
    overflow: hidden;
}

#fad-duration {
    margin-left: 10px;
}
#fad-background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
}

.fad-background-fade {
    transition: background-image 1s linear;
}
body.video-full-screen.video-full-screen--hide-ui {
    cursor: auto;
}
#full-app-display button {
    background-color: transparent;
    border: 0;
    color: currentColor;
    padding: 0 5px;
}
#fad-status-controls {
  transition : all 0.5s ease-in-out;
}
.top-fragment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-top: 50px;
  padding-left: 90px;
  display:flex;
  gap:15px;
}
.slider {
  width: 100%;
}
`;

  const styleChoices = [
    `
#fad-foreground {
    display:block;
    flex-direction: row;
    text-align: left;
    bottom:50px;
    padding-left : 100px;
    padding-right:100px;
    position : absolute;
}
#fad-art {
    width: calc(100vw - 840px);
    min-width: 150px;
    max-width: 150px;
}
#fad-details {
    padding-left: 20px;
    line-height: initial;
    max-width: 70%;
    color: #FFFFFF;
}
#fad-title {
    font-size: 40px;
    font-weight: var(--glue-font-weight-black);
}
#fad-artist, #fad-album {
    font-size: 34px;
    font-weight: var(--glue-font-weight-medium);
}
#fad-artist svg, #fad-album svg {
    margin-right: 5px;
}
#fad-status {
    display: flex;
    width:100%;
    align-items: center;
}
#fad-status.active {
    margin-top: 20px;
}
#fad-controls {
    display: flex;
    margin-right: 10px;
}
#fac-controls button {
  cursor : pointer;
}
#fad-elapsed {
    min-width: 52px;
}`,
    `
#fad-art {
    width: calc(100vh - 400px);
    max-width: 340px;
}
#fad-foreground {
    flex-direction: column;
    text-align: center;
}
#fad-details {
    padding-top: 50px;
    line-height: initial;
    max-width: 70%;
    color: #FFFFFF;
}
#fad-title {
    font-size: 54px;
    font-weight: var(--glue-font-weight-black);
}
#fad-artist, #fad-album {
    font-size: 33px;
    font-weight: var(--glue-font-weight-medium);
}
#fad-artist svg, #fad-album svg {
    width: 25px;
    height: 25px;
    margin-right: 5px;
}
#fad-status {
    display: flex;
    min-width: 400px;
    max-width: 400px;
    align-items: center;
    flex-direction: column;
}
#fad-status.active {
    margin: 20px auto 0;
}
#fac-controls button {
  cursor : pointer;
}
#fad-controls {
    margin-top: 20px;
    order: 2
}

#fad-elapsed {
    min-width: 56px;
    margin-right: 10px;
    text-align: right;
}`,
  ];

  const iconStyleChoices = [
    `
#fad-artist svg, #fad-album svg {
    display: none;
}`,
    `
#fad-artist svg, #fad-album svg {
    display: inline-block;
}`,
  ];

  const container = document.createElement("div");
  container.id = "full-app-display";
  container.classList.add(
    "Video",
    "VideoPlayer--fullscreen",
    "VideoPlayer--landscape"
  );

  let cover, back, title, artist, album, prog, elaps, durr, play;
  const nextTrackImg = new Image();
  const artistImage = new Image();

  function render() {
    Spicetify.Player.removeEventListener("songchange", updateInfo);
    Spicetify.Player.removeEventListener("onprogress", updateProgress);
    Spicetify.Player.removeEventListener("onplaypause", updateControl);

    style.innerHTML =
      styleBase +
      styleChoices[CONFIG.vertical ? 1 : 0] +
      iconStyleChoices[CONFIG.icons ? 1 : 0];

    container.innerHTML = `
<canvas id="fad-background"></canvas>
<div id="fad-header"></div>
<div class="top-fragment">
<div style="width:50px;height: 50px">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1333.33 1333.3" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"><path d="M666.66 0C298.48 0 0 298.47 0 666.65c0 368.19 298.48 666.65 666.66 666.65 368.22 0 666.67-298.45 666.67-666.65C1333.33 298.49 1034.88.03 666.65.03l.01-.04zm305.73 961.51c-11.94 19.58-37.57 25.8-57.16 13.77-156.52-95.61-353.57-117.26-585.63-64.24-22.36 5.09-44.65-8.92-49.75-31.29-5.12-22.37 8.84-44.66 31.26-49.75 253.95-58.02 471.78-33.04 647.51 74.35 19.59 12.02 25.8 37.57 13.77 57.16zm81.6-181.52c-15.05 24.45-47.05 32.17-71.49 17.13-179.2-110.15-452.35-142.05-664.31-77.7-27.49 8.3-56.52-7.19-64.86-34.63-8.28-27.49 7.22-56.46 34.66-64.82 242.11-73.46 543.1-37.88 748.89 88.58 24.44 15.05 32.16 47.05 17.12 71.46V780zm7.01-189.02c-214.87-127.62-569.36-139.35-774.5-77.09-32.94 9.99-67.78-8.6-77.76-41.55-9.98-32.96 8.6-67.77 41.56-77.78 235.49-71.49 626.96-57.68 874.34 89.18 29.69 17.59 39.41 55.85 21.81 85.44-17.52 29.63-55.89 39.4-85.42 21.8h-.03z" fill="#fff" fill-rule="nonzero"/></svg>
</div>
<div style="font-weight: var(--glue-font-weight-bold);line-height: 50px;font-size:20px">
Playing from <span id="top-frag-title"></span>
</div>
</div>
<div id="fad-foreground">
<div style="display:flex">
    <div id="fad-art">
        <div id="fad-art-image">
            <div id="fad-art-inner"></div>
        </div>
    </div>
    <div id="fad-details">
        <div id="fad-title"></div>
        <div id="fad-artist">
            <svg height="35" width="35" viewBox="0 0 16 16" fill="currentColor">
                ${Spicetify.SVGIcons.artist}
            </svg>
            <span></span>
        </div>
        ${
          CONFIG.showAlbum
            ? `<div id="fad-album">
            <svg height="35" width="35" viewBox="0 0 16 16" fill="currentColor">
                ${Spicetify.SVGIcons.album}
            </svg>
            <span></span>
        </div>`
            : ""
        }
        </div>
           </div>
<div id = "fad-status-controls">
 <div id="fad-status" class="${
   CONFIG.enableControl || CONFIG.enableProgress ? "active" : ""
 }">
            
            <div id="fad-progress-container">
                <span id="fad-elapsed"></span>
                <input id="fad-progress-inner" type="range" min="1" max="100" class="slider"/>
                <span id="fad-duration"></span>
            </div>
              
        </div>
        
        <div id="fad-controls">
            
             
                 <button id="fad-back">
                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                    ${Spicetify.SVGIcons["skip-back"]}
                </svg>
            </button>
                
            <button id="fad-play">
                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                    ${Spicetify.SVGIcons.play}
                </svg>
            </button>
            <button id="fad-next">
                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                    ${Spicetify.SVGIcons["skip-forward"]}
                </svg>
            </button>
        </div></div></div>`;

    back = container.querySelector("canvas");
    back.width = window.innerWidth;
    back.height = window.innerHeight;
    cover = container.querySelector("#fad-art-image");
    title = container.querySelector("#fad-title");
    artist = container.querySelector("#fad-artist span");
    album = container.querySelector("#fad-album span");

    prog = container.querySelector("#fad-progress-inner");
    durr = container.querySelector("#fad-duration");
    elaps = container.querySelector("#fad-elapsed");
    prog.onchange = function (e) {
      shouldProgressUpdate = true;

      var val = e.target.value;
      Spicetify.Player.seek(val / 100);
    };
    prog.oninput = function () {
      shouldProgressUpdate = false;
    };
    if (CONFIG.enableControl) {
      play = container.querySelector("#fad-play");
      play.onclick = Spicetify.Player.togglePlay;
      container.querySelector("#fad-next").onclick = Spicetify.Player.next;

      container.querySelector("#fad-back").onclick = Spicetify.Player.back;
    }
  }

  const classes = [
    "video",
    "video-full-screen",
    "video-full-window",
    "video-full-screen--hide-ui",
    "fad-activated",
  ];

  function getAlbumInfo(uri) {
    return Spicetify.CosmosAsync.get(
      `hm://album/v1/album-app/album/${uri}/desktop`
    );
  }
  function getArtistInfo(uri) {
    return Spicetify.CosmosAsync.get(
      "https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&variables=%7B%22uri%22%3A%22spotify%3Aartist%3A" +
        uri.replace("spotify:artist:", "") +
        "%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22d66221ea13998b2f81883c5187d174c8646e4041d67f5b1e103bc262d447e3a0%22%7D%7D"
    );
  }
  async function updateInfo() {
    const meta = Spicetify.Player.data.track.metadata;

    const artistInfo = await getArtistInfo(
      Spicetify.Player.data.track.metadata.artist_uri
    );
    // prepare title
    let rawTitle = meta.title;
    if (CONFIG.trimTitle) {
      rawTitle = rawTitle
        .replace(/\(.+?\)/g, "")
        .replace(/\[.+?\]/g, "")
        .replace(/\s\-\s.+?$/, "")
        .trim();
    }

    // prepare artist
    let artistName;
    if (CONFIG.showAllArtists) {
      artistName = Object.keys(meta)
        .filter((key) => key.startsWith("artist_name"))
        .sort()
        .map((key) => meta[key])
        .join(", ");
    } else {
      artistName = meta.artist_name;
    }

    // prepare album
    let albumText;
    if (CONFIG.showAlbum) {
      albumText = meta.album_title || "";
      const albumURI = meta.album_uri;
      if (albumURI?.startsWith("spotify:album:")) {
        const albumInfo = await getAlbumInfo(
          albumURI.replace("spotify:album:", "")
        );

        const albumDate = new Date(
          albumInfo.year,
          (albumInfo.month || 1) - 1,
          albumInfo.day || 0
        );
        const recentDate = new Date();
        recentDate.setMonth(recentDate.getMonth() - 6);
        const dateStr = albumDate.toLocaleString(
          "default",
          albumDate > recentDate
            ? {
                year: "numeric",
                month: "short",
              }
            : {
                year: "numeric",
              }
        );

        albumText += " • " + dateStr;
      }
    }

    // prepare duration
    let durationText;
    if (CONFIG.enableProgress) {
      durationText = Spicetify.Player.formatTime(meta.duration);
    }
    document.querySelector("#top-frag-title").textContent =
      meta.album_title || "Tracks";
    // Wait until next track image is downloaded then update UI text and images

    nextTrackImg.src = meta.image_xlarge_url;
    const previousImg = artistImage.cloneNode();
    console.log(artistInfo.data);
    artistImage.src = artistInfo.data.artist.visuals.headerImage.sources[0].url;

    artistImage.onload = () => {
      animateCanvas(previousImg, artistImage);
    };
    nextTrackImg.onload = () => {
      const bgImage = `url("${nextTrackImg.src}")`;
      cover.style.backgroundImage = bgImage;
      title.innerText = rawTitle || "";
      artist.innerText = artistName || "";
      if (album) {
        album.innerText = albumText || "";
      }
      if (durr) {
        durr.innerText = durationText || "";
      }
    };
    nextTrackImg.onerror = () => {
      // Placeholder
      nextTrackImg.src =
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCI+CiAgPHJlY3Qgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB4PSIwIiB5PSIwIiAvPgogIDxwYXRoIGZpbGw9IiNCM0IzQjMiIGQ9Ik0yNi4yNSAxNi4xNjJMMjEuMDA1IDEzLjEzNEwyMS4wMTIgMjIuNTA2QzIwLjU5NCAyMi4xOTIgMjAuMDgxIDIxLjk5OSAxOS41MTkgMjEuOTk5QzE4LjE0MSAyMS45OTkgMTcuMDE5IDIzLjEyMSAxNy4wMTkgMjQuNDk5QzE3LjAxOSAyNS44NzggMTguMTQxIDI2Ljk5OSAxOS41MTkgMjYuOTk5QzIwLjg5NyAyNi45OTkgMjIuMDE5IDI1Ljg3OCAyMi4wMTkgMjQuNDk5QzIyLjAxOSAyNC40MjIgMjIuMDA2IDE0Ljg2NyAyMi4wMDYgMTQuODY3TDI1Ljc1IDE3LjAyOUwyNi4yNSAxNi4xNjJaTTE5LjUxOSAyNS45OThDMTguNjkyIDI1Ljk5OCAxOC4wMTkgMjUuMzI1IDE4LjAxOSAyNC40OThDMTguMDE5IDIzLjY3MSAxOC42OTIgMjIuOTk4IDE5LjUxOSAyMi45OThDMjAuMzQ2IDIyLjk5OCAyMS4wMTkgMjMuNjcxIDIxLjAxOSAyNC40OThDMjEuMDE5IDI1LjMyNSAyMC4zNDYgMjUuOTk4IDE5LjUxOSAyNS45OThaIi8+Cjwvc3ZnPgo=";
    };
  }

  function animateCanvas(prevImg, nextImg) {
    const { innerWidth: width, innerHeight: height } = window;
    back.width = width;
    back.height = height;
    const ctx = back.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const center_X = width / 2;
    const center_Y = height / 2;
    const img_center_X = nextImg.width / 2;
    const img_center_Y = nextImg.height / 2;
    ctx.filter = `brightness(0.6)`;
    let factor = 0.0;
    let animate = () => {
      ctx.globalAlpha = 1;
      ctx.drawImage(
        prevImg,
        width > prevImg.width ? 0 : -(img_center_X - center_X),
        height > prevImg.height ? 0 : -(img_center_Y - center_Y),
        width > prevImg.width ? width : prevImg.width,
        height > prevImg.height ? height : prevImg.height
      );
      ctx.globalAlpha = Math.sin((Math.PI / 2) * factor);
      ctx.drawImage(
        nextImg,
        width > nextImg.width ? 0 : -(img_center_X - center_X),
        height > nextImg.height ? 0 : -(img_center_Y - center_Y),
        width > nextImg.width ? width : nextImg.width,
        height > nextImg.height ? height : nextImg.height
      );

      if (factor < 1.0) {
        factor += 0.016;
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  function updateProgress(event) {
    elaps.innerText = Spicetify.Player.formatTime(event.data);
    if (!shouldProgressUpdate) return;
    prog.value = (event.data / Spicetify.Player.origin._state.duration) * 100;
    var valPercent =
      (prog.valueAsNumber - parseInt(prog.min)) /
      (parseInt(prog.max) - parseInt(prog.min));
    prog.style.background =
      "linear-gradient(to right, var(--spice-button) 0%, var(--spice-button) " +
      prog.value +
      "%, transparent " +
      prog.value +
      "%, transparent 100%)";
  }

  function updateControl({ data }) {
    if (data.is_paused) {
      play.innerHTML = `<svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.play}</svg>`;
    } else {
      play.innerHTML = `<svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.pause}</svg>`;
    }
  }

  function activate() {
    updateInfo();
    Spicetify.Player.addEventListener("songchange", updateInfo);
    if (CONFIG.enableProgress) {
      Spicetify.Player.addEventListener("onprogress", updateProgress);
    }
    if (CONFIG.enableControl) {
      updateControl({
        data: { is_paused: !Spicetify.Player.isPlaying() },
      });
      Spicetify.Player.addEventListener("onplaypause", updateControl);
    }
    if (CONFIG.enableFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.webkitIsFullScreen) {
      document.exitFullscreen();
    }
    if (CONFIG.enableFade) {
      cover.classList.add("fad-background-fade");
    } else {
      cover.classList.remove("fad-background-fade");
    }

    document.body.classList.add(...classes);
    document.body.append(style, container);
    let mouseTimeout = null;
    mouseHandler = document.body.addEventListener("mousemove", () => {
      // remove fad-controls if mouse is not moved for 3 secs
      if (mouseTimeout) {
        clearTimeout(mouseTimeout);
      }
      let t = document.querySelector("#fad-status-controls");
      mouseTimeout = setTimeout(() => {
        t.style.marginTop = "-50px";
        t.style.opacity = "0";
      }, 3000);
      t.style.opacity = "1";
      t.style.marginTop = "0px";
    });
    setTimeout(() => {
      document.getElementById("full-app-display").style.opacity = "1";
    }, 100);
  }

  function deactivate() {
    Spicetify.Player.removeEventListener("songchange", updateInfo);
    if (CONFIG.enableProgress) {
      Spicetify.Player.removeEventListener("onprogress", updateProgress);
    }
    if (CONFIG.enableControl) {
      Spicetify.Player.removeEventListener("onplaypause", updateControl);
    }
    if (CONFIG.enableFullscreen || document.webkitIsFullScreen) {
      document.exitFullscreen();
    }
    document.getElementById("full-app-display").style.opacity = "0";
    setTimeout(() => {
      document.removeEventListener("mousemove", mouseHandler);
      document.body.classList.remove(...classes);
      style.remove();
      container.remove();
    }, 500);
  }

  function getConfig() {
    try {
      const parsed = JSON.parse(
        Spicetify.LocalStorage.get("full-app-display-config")
      );
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
      throw "";
    } catch {
      Spicetify.LocalStorage.set("full-app-display-config", "{}");
      return {};
    }
  }

  function saveConfig() {
    Spicetify.LocalStorage.set(
      "full-app-display-config",
      JSON.stringify(CONFIG)
    );
  }

  function newMenuItem(name, key) {
    const container = document.createElement("div");
    container.innerHTML = `
<div class="setting-row">
    <label class="col description">${name}</label>
    <div class="col action"><button class="switch">
        <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            ${Spicetify.SVGIcons.check}
        </svg>
    </button></div>
</div>`;

    const slider = container.querySelector("button");
    slider.classList.toggle("disabled", !CONFIG[key]);

    slider.onclick = () => {
      const state = slider.classList.contains("disabled");
      slider.classList.toggle("disabled");
      CONFIG[key] = state;
      saveConfig();
      render();
      activate();
    };

    return container;
  }

  let configContainer;
  function openConfig(event) {
    event.preventDefault();
    if (!configContainer) {
      configContainer = document.createElement("div");
      configContainer.id = "popup-config-container";
      const style = document.createElement("style");
      style.innerHTML = `
.setting-row::after {
    content: "";
    display: table;
    clear: both;
}
.setting-row .col {
    display: flex;
    padding: 10px 0;
    align-items: center;
}
.setting-row .col.description {
    float: left;
    padding-right: 15px;
}
.setting-row .col.action {
    float: right;
    text-align: right;
}
button.switch {
    align-items: center;
    border: 0px;
    border-radius: 50%;
    background-color: rgba(var(--spice-rgb-shadow), .7);
    color: var(--spice-text);
    cursor: pointer;
    display: flex;
    margin-inline-start: 12px;
    padding: 8px;
}
button.switch.disabled {
    color: rgba(var(--spice-rgb-text), .3);
}`;

      configContainer.append(
        style,
        newMenuItem("Enable progress bar", "enableProgress"),
        newMenuItem("Enable controls", "enableControl"),
        newMenuItem("Trim title", "trimTitle"),
        newMenuItem("Show album", "showAlbum"),
        newMenuItem("Show all artists", "showAllArtists"),
        newMenuItem("Show icons", "icons"),
        newMenuItem("Vertical mode", "vertical"),
        newMenuItem("Enable fullscreen", "enableFullscreen"),
        newMenuItem("Enable song change animation", "enableFade")
      );
    }
    Spicetify.PopupModal.display({
      title: "Full App Display",
      content: configContainer,
    });
  }

  container.ondblclick = deactivate;
  container.oncontextmenu = openConfig;

  function toggleFad() {
    if (document.body.classList.contains("fad-activated")) {
      deactivate();
    } else {
      activate();
    }
  }

  // Add activator on top bar
  new Spicetify.Topbar.Button(
    "Full App Display",
    `<svg role="img" height="16" width="16" viewBox="0 0 32 32" fill="currentColor"><path d="M8.645 22.648l-5.804 5.804.707.707 5.804-5.804 2.647 2.646v-6h-6l2.646 2.647zM29.157 3.55l-.707-.707-5.804 5.805L20 6.001v6h6l-2.646-2.647 5.803-5.804z"></path></svg>`,
    activate
  );

  Spicetify.Keyboard.registerShortcut(
    {
      key: Spicetify.Keyboard.KEYS["F11"],
      ctrl: false,
      shift: false,
      alt: false,
    },
    toggleFad
  );

  render();
})();
