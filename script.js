// Super basic data
var allPlaylists = [];

// Getting HTML elements
var playlistNameInput = document.getElementById("playlistNameInput");
var createPlaylistBtn = document.getElementById("createPlaylistBtn");
var playlistSelect = document.getElementById("playlistSelect");
var videoTitleInput = document.getElementById("videoTitleInput");
var videoUrlInput = document.getElementById("videoUrlInput");
var addVideoBtn = document.getElementById("addVideoBtn");
var playlistsContainer = document.getElementById("playlistsContainer");
var clearAllBtn = document.getElementById("clearAllBtn");
var playlistPlayerFrame = document.getElementById("playlistPlayerFrame");
var nowPlayingText = document.getElementById("nowPlayingText");

// Load old data if present
var oldData = localStorage.getItem("myYoutubePlaylists");
if (oldData) {
  allPlaylists = JSON.parse(oldData);
}

// First render
showEverything();

// Create playlist button click
createPlaylistBtn.addEventListener("click", function () {
  var pName = playlistNameInput.value.trim();

  if (pName === "") {
    alert("Type playlist name first");
    return;
  }

  for (var c = 0; c < allPlaylists.length; c++) {
    if (allPlaylists[c].name.toLowerCase() === pName.toLowerCase()) {
      alert("Playlist already exists");
      return;
    }
  }

  var newPlaylist = {
    name: pName,
    videos: []
  };

  allPlaylists.push(newPlaylist);
  playlistNameInput.value = "";

  saveData();
  showEverything();
});

// Add video button click
addVideoBtn.addEventListener("click", function () {
  var selectedName = playlistSelect.value;
  var vTitle = videoTitleInput.value.trim();
  var vUrl = videoUrlInput.value.trim();

  if (allPlaylists.length === 0) {
    alert("First make one playlist");
    return;
  }

  if (vTitle === "" || vUrl === "") {
    alert("Type title and URL");
    return;
  }

  if (vUrl.indexOf("youtube.com") === -1 && vUrl.indexOf("youtu.be") === -1) {
    alert("Please add only YouTube URL");
    return;
  }

  for (var i = 0; i < allPlaylists.length; i++) {
    if (allPlaylists[i].name === selectedName) {
      var newVideo = {
        title: vTitle,
        url: vUrl
      };
      allPlaylists[i].videos.push(newVideo);
    }
  }

  videoTitleInput.value = "";
  videoUrlInput.value = "";

  saveData();
  showEverything();
});

clearAllBtn.addEventListener("click", function () {
  if (allPlaylists.length === 0) {
    alert("Nothing to clear");
    return;
  }

  var ok = confirm("Delete all playlists?");
  if (ok) {
    allPlaylists = [];
    saveData();
    showEverything();
  }
});

function showEverything() {
  // Show select options
  playlistSelect.innerHTML = "";

  if (allPlaylists.length === 0) {
    var op = document.createElement("option");
    op.textContent = "No playlist";
    op.value = "";
    playlistSelect.appendChild(op);
  } else {
    for (var i = 0; i < allPlaylists.length; i++) {
      var option = document.createElement("option");
      option.textContent = allPlaylists[i].name;
      option.value = allPlaylists[i].name;
      playlistSelect.appendChild(option);
    }
  }

  // Show playlist cards
  playlistsContainer.innerHTML = "";

  if (allPlaylists.length === 0) {
    playlistsContainer.innerHTML = "<p class='empty-text'>No playlist yet</p>";
    return;
  }

  for (var p = 0; p < allPlaylists.length; p++) {
    var card = document.createElement("div");
    card.className = "playlist-card";

    var heading = document.createElement("h3");
    heading.textContent = allPlaylists[p].name;
    card.appendChild(heading);

    if (allPlaylists[p].videos.length === 0) {
      var noVideo = document.createElement("p");
      noVideo.className = "empty-text";
      noVideo.textContent = "No video in this playlist";
      card.appendChild(noVideo);
    } else {
      var playPlaylistBtn = document.createElement("button");
      playPlaylistBtn.textContent = "Play Full Playlist";
      playPlaylistBtn.className = "action-btn play-playlist-btn";
      playPlaylistBtn.setAttribute("data-pindex", p);
      playPlaylistBtn.addEventListener("click", function () {
        var pIndex = Number(this.getAttribute("data-pindex"));
        playPlaylistInsideApp(allPlaylists[pIndex]);
      });
      card.appendChild(playPlaylistBtn);

      var ul = document.createElement("ul");
      ul.className = "video-list";

      for (var v = 0; v < allPlaylists[p].videos.length; v++) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        var delVideoBtn = document.createElement("button");
        var currentVideo = allPlaylists[p].videos[v];

        a.textContent = currentVideo.title;
        a.href = "#";
        a.addEventListener("click", function (event) {
          event.preventDefault();
          var videoUrl = this.getAttribute("data-video-url");
          var videoTitle = this.getAttribute("data-video-title");
          playSingleVideoInsideApp(videoUrl, videoTitle);
        });
        a.setAttribute("data-video-url", currentVideo.url);
        a.setAttribute("data-video-title", currentVideo.title);

        delVideoBtn.textContent = "Delete";
        delVideoBtn.className = "action-btn delete-video-btn";
        delVideoBtn.setAttribute("data-pindex", p);
        delVideoBtn.setAttribute("data-vindex", v);
        delVideoBtn.addEventListener("click", function () {
          var pIndex = Number(this.getAttribute("data-pindex"));
          var vIndex = Number(this.getAttribute("data-vindex"));
          allPlaylists[pIndex].videos.splice(vIndex, 1);
          saveData();
          showEverything();
        });

        li.appendChild(a);
        li.appendChild(delVideoBtn);
        ul.appendChild(li);
      }

      card.appendChild(ul);
    }

    var delPlaylistBtn = document.createElement("button");
    delPlaylistBtn.textContent = "Delete Playlist";
    delPlaylistBtn.className = "action-btn delete-playlist-btn";
    delPlaylistBtn.setAttribute("data-pindex", p);
    delPlaylistBtn.addEventListener("click", function () {
      var pIndex = Number(this.getAttribute("data-pindex"));
      allPlaylists.splice(pIndex, 1);
      saveData();
      showEverything();
    });
    card.appendChild(delPlaylistBtn);

    playlistsContainer.appendChild(card);
  }
}

function saveData() {
  localStorage.setItem("myYoutubePlaylists", JSON.stringify(allPlaylists));
}

function playPlaylistInsideApp(playlist) {
  var videoIds = [];

  for (var i = 0; i < playlist.videos.length; i++) {
    var videoId = getYouTubeVideoId(playlist.videos[i].url);

    if (videoId && videoIds.indexOf(videoId) === -1) {
      videoIds.push(videoId);
    }
  }

  if (videoIds.length === 0) {
    alert("No valid YouTube videos found in this playlist");
    return;
  }

  if (!playlistPlayerFrame) {
    alert("Player not found on page");
    return;
  }

  var firstVideoId = videoIds[0];
  var remainingVideoIds = videoIds.slice(1).join(",");
  var embedUrl = "https://www.youtube.com/embed/" + firstVideoId + "?autoplay=1&rel=0";

  if (remainingVideoIds !== "") {
    embedUrl += "&playlist=" + remainingVideoIds;
  }

  playlistPlayerFrame.src = embedUrl;
  if (nowPlayingText) {
    nowPlayingText.textContent = "Now Playing Playlist: " + playlist.name;
  }
}

function playSingleVideoInsideApp(videoUrl, videoTitle) {
  var videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }

  if (!playlistPlayerFrame) {
    alert("Player not found on page");
    return;
  }

  var embedUrl = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0";
  playlistPlayerFrame.src = embedUrl;

  if (nowPlayingText) {
    nowPlayingText.textContent = "Now Playing: " + videoTitle;
  }
}

function getYouTubeVideoId(videoUrl) {
  try {
    var parsedUrl = new URL(videoUrl);
    var host = parsedUrl.hostname.replace("www.", "");

    if (host === "youtu.be") {
      return parsedUrl.pathname.replace("/", "").trim();
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v");
      }

      if (parsedUrl.pathname.indexOf("/shorts/") === 0 || parsedUrl.pathname.indexOf("/embed/") === 0) {
        var pathParts = parsedUrl.pathname.split("/");
        return pathParts[pathParts.length - 1];
      }
    }
  } catch (error) {
    return "";
  }

  return "";
}
