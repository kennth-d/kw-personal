const pauseSVG = `
  <svg viewBox="0 0 50 50">
    <path d="M 20 15 L 23 15 L 23 35 L 20 35 Z M 28 15 L 31 15 L 31 35 L 28 35 Z"></path>
  </svg>
`;

const playSVG = `
  <svg viewBox="0 0 50 50">
    <polygon points="20 15, 35 25, 20 35"></polygon>
  </svg>
`;

const videoUrls = [
    "./static/video/DBFZ-assist.mp4",
    "./static/video/DBFZ-defense.mp4",
    "./static/video/DBFZ-feint.mp4",
    "./static/video/DBFZ-hbd.mp4",
    "./static/video/DBFZ-mix.mp4",
    "./static/video/DBFZ-tod.mp4",
];
const videoDescriptions = [
    "One of the core mechanics of the game allows you to call out your other characters breifly to attack, or in some cases defend.",
    "Sometimes playing defense is the way to go.",
    "Sparking blast is the best defensive mechanics in the game, feinting an attack is one way to counter it.",
    "A happy birthday is when the opponent is hit along with their assist, the assist character takes much more damage in this state.",
    "Mix is a term used to describe attacks that are not so clear to the opponent. Good mix ups are attacks that can hit high, low or cross-up on the same frame.",
    "A TOD or touch of death is when an opponent at full health is taken out by one combo.",
];
const videoHeaders = [
    "Assists",
    "Defense",
    "Feints",
    "Happy Birth Days",
    "Mix",
    "TOD"
];

const videoWrapper = document.querySelector("#video-wrapper");
const videoHeader = document.querySelector("#video-header");
const videoDescription = document.querySelector("#video-description");

var video = document.querySelector("video");
video.onended = onVideoEnd;
const source = document.querySelector("source");
const loadingScreen = document.querySelector("#loading-screen");

const playBtn = document.querySelector("button#play");
const playBtnIcon = playBtn.lastChild;

const prevBtn = document.querySelector("button#previous");
const nextBtn = document.querySelector("button#next");

var isPlaying = false;
var currentVideoIdx = 0;
const videos = [];
var isLoaded = false;

function preloadVideos(urls) {
    let loadedVids = 0;
    urls.forEach(url => {
        const videoElement = document.createElement("video");
        
        videoElement.src = url;
        videoElement.load();

        videoElement.oncanplaythrough  = () => {
            loadedVids++;
            if (loadedVids === urls.length) {
                isLoaded = true;
                enableButtons();
                loadingScreen.style.display = "none";
            };
        };
        videos.push(videoElement);
    });
}

function swapVideo(idx) {
    const currentVideo = videoWrapper.querySelector("video");
    if (currentVideo) {
        currentVideo.remove();
    };
    const newVideo = videos[idx];
    videoWrapper.appendChild(newVideo);
    video = newVideo;
    video.onended = onVideoEnd;

    videoDescription.innerHTML = videoDescriptions[idx];
    videoHeader.innerHTML = videoHeaders[idx];
}
//swaps the svg of the play btn.
function updatePlayBtnIcon() {
    playBtnIcon.innerHTML = isPlaying ? pauseSVG : playSVG;
}//end updatePlayBtnIcon

function enableButtons() {
    playBtn.addEventListener("click", () => {
        if (!isPlaying) {
            video.play()
        } else {
            video.pause();
        }
        isPlaying = !isPlaying;
        updatePlayBtnIcon();
    });
    prevBtn.addEventListener("click", () =>{
        if (isPlaying) video.pause();
        if (currentVideoIdx < 1) {
            currentVideoIdx = videos.length - 1;
        } else {
            currentVideoIdx--;
        }//end if else

        swapVideo(currentVideoIdx);
        isPlaying = false;
        updatePlayBtnIcon()
    });
    nextBtn.addEventListener("click", () =>{
        if (isPlaying) video.pause();
        currentVideoIdx = (currentVideoIdx + 1) % (videos.length);

        swapVideo(currentVideoIdx);
        isPlaying = false;
        playBtnIcon.innerHTML = playSVG;
    });
};

function onVideoEnd() {
    isPlaying = false;
    updatePlayBtnIcon();
}
window.addEventListener("load", () => {
    preloadVideos(videoUrls);
});
