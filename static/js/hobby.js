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
    "./static/video/DBFZ - assist.mp4",
    "./static/video/DBFZ - defense.mp4",
    "./static/video/DBFZ - feint.mp4",
    "./static/video/DBFZ - hbd.mp4",
    "./static/video/DBFZ - mix.mp4",
    "./static/video/DBFZ - tod.mp4",
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

const videoHeader = document.querySelector("#video-header");
const videoDescription = document.querySelector("#video-description");

const video = document.querySelector("video");
const source = document.querySelector("source");

const playBtn = document.querySelector("button#play");
const playBtnIcon = playBtn.lastChild;

const prevBtn = document.querySelector("button#previous");
const nextBtn = document.querySelector("button#next");

var isPlaying = false;
var currentVideoIdx = 0;
const videoBlobs = [];


//load videos
Promise.all(videoUrls.map(url =>
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            return response.blob();
    })
)).then(blobs =>{
    videoBlobs.push(...blobs);
}).catch(err =>{
    console.log("Error occured while loading videos: ", err);
});

//changes video, description and header.
function swapVideo(idx) {
    video.src = URL.createObjectURL(videoBlobs[idx]);
    video.load();
    videoDescription.innerHTML = videoDescriptions[idx];
    videoHeader.innerHTML = videoHeaders[idx];
}//end swapVideo

//swaps the svg of the play btn.
function updatePlayBtnIcon() {
    playBtnIcon.innerHTML = isPlaying ? pauseSVG : playSVG;
}//end updatePlayBtnIcon

window.addEventListener("load", () => {

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
            currentVideoIdx = videoBlobs.length - 1;
        } else {
            currentVideoIdx--;
        }//end if else

        swapVideo(currentVideoIdx);
        isPlaying = false;
        updatePlayBtnIcon()
    });
    nextBtn.addEventListener("click", () =>{
        if (isPlaying) video.pause();
        currentVideoIdx = (currentVideoIdx + 1) % (videoBlobs.length - 1);

        swapVideo(currentVideoIdx);
        isPlaying = false;
        playBtnIcon.innerHTML = playSVG;
    });
    video.addEventListener("ended", () => {
        isPlaying = false;
        updatePlayBtnIcon()
    });
    video.addEventListener("canplay", () => {
        const loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.display = "none";
    })
});