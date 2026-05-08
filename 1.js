

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
      var ul = document.createElement("ul");
      ul.className = "video-list";

      for (var v = 0; v < allPlaylists[p].videos.length; v++) {
        var li = document.createElement("li");
        var a = document.createElement("a");

        a.textContent = allPlaylists[p].videos[v].title;
        a.href = allPlaylists[p].videos[v].url;
        a.target = "_blank";

        li.appendChild(a);
        ul.appendChild(li);
      }

      card.appendChild(ul);
    }

    playlistsContainer.appendChild(card);
  }
}

function saveData() {
  localStorage.setItem("myYoutubePlaylists", JSON.stringify(allPlaylists));
}

