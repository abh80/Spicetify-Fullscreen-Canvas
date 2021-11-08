// @ts-check
// NAME: Full App Display
// AUTHOR: khanhas
// VERSION: 1.0
// DESCRIPTION: Fancy artwork and track status display.

/// <reference path="./global.d.ts" />

(function FullAppDisplay() {
  if (!Spicetify.Keyboard) {
    setTimeout(FullAppDisplay, 200);
    return;
  }

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
#fad-progress-inner {
    height: 100%;
    border-radius: 6px;
    background-color: #ffffff;
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.8);
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
            ${
              CONFIG.enableProgress
                ? `
            <div id="fad-progress-container">
                <span id="fad-elapsed"></span>
                <div id="fad-progress"><div id="fad-progress-inner"></div></div>
                <span id="fad-duration"></span>
            </div>`
                : ""
            }
        </div>
        ${
          CONFIG.enableControl
            ? `
        <div id="fad-controls">
            ${
              CONFIG.vertical
                ? `<button id="fad-back">
                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                    ${Spicetify.SVGIcons["skip-back"]}
                </svg>
            </button>`
                : ""
            }
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
        </div></div>`
            : ""
        }

</div>`;

    back = container.querySelector("canvas");
    back.width = window.innerWidth;
    back.height = window.innerHeight;
    cover = container.querySelector("#fad-art-image");
    title = container.querySelector("#fad-title");
    artist = container.querySelector("#fad-artist span");
    album = container.querySelector("#fad-album span");

    if (CONFIG.enableProgress) {
      prog = container.querySelector("#fad-progress-inner");
      durr = container.querySelector("#fad-duration");
      elaps = container.querySelector("#fad-elapsed");
    }

    if (CONFIG.enableControl) {
      play = container.querySelector("#fad-play");
      play.onclick = Spicetify.Player.togglePlay;
      container.querySelector("#fad-next").onclick = Spicetify.Player.next;
      if (CONFIG.vertical) {
        container.querySelector("#fad-back").onclick = Spicetify.Player.back;
      }
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
      `https://api.spotify.com/v1/artists/${uri.replace("spotify:artist:", "")}`
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

    // Wait until next track image is downloaded then update UI text and images

    nextTrackImg.src = meta.image_xlarge_url;
    const previousImg = artistImage.cloneNode();
    artistImage.src = artistInfo.images[0].url;

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
    const dim = width > height ? width : height;

    const ctx = back.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.filter = `blur(5px) brightness(0.6)`;
    const blur = 5;

    if (!CONFIG.enableFade) {
      ctx.globalAlpha = 1;
      ctx.drawImage(
        nextImg,
        -blur * 2,
        -blur * 2 - (width - height) / 2,
        dim + 4 * blur,
        dim + 4 * blur
      );
      return;
    }

    let factor = 0.0;
    const animate = () => {
      ctx.globalAlpha = 1;
      ctx.drawImage(
        prevImg,
        -blur * 2,
        -blur * 2 - (width - height) / 2,
        dim + 4 * blur,
        dim + 4 * blur
      );
      ctx.globalAlpha = Math.sin((Math.PI / 2) * factor);
      ctx.drawImage(
        nextImg,
        -blur * 2,
        -blur * 2 - (width - height) / 2,
        dim + 4 * blur,
        dim + 4 * blur
      );

      if (factor < 1.0) {
        factor += 0.016;
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  function updateProgress(event) {
    prog.style.width =
      (event.data / Spicetify.Player.origin._state.duration) * 100 + "%";
    elaps.innerText = Spicetify.Player.formatTime(event.data);
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
