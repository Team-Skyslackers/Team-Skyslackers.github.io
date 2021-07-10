let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");
console.log(now_playing)
let playpause_btn = document.querySelector(".playpause-track");

let slider = document.querySelector(".slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let isUpdating = true;
let updateTimer;
// let duration;
// Create new audio element
let curr_track = document.createElement('audio');
let pinned = [];
let output = [];
let csvText = '';
let strings = "";
let table_str = "";
let pin_num = 0;
let leftpx = 74;
let rightpx = 1354;

//74～1354px
// Define the tracks that have to be played
// let track_list = [
//   {
//     name: "Night Owl",
//     artist: "Broke For Free",
//     image: "https://images.pexels.com/photos/2264753/pexels-photo-2264753.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
//     path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3"
//   },
//   {
//     name: "Enthusiast",
//     artist: "Tours",
//     image: "https://images.pexels.com/photos/3100835/pexels-photo-3100835.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
//     path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
//   },
//   {
//     name: "Shipping Lanes",
//     artist: "Chad Crouch",
//     image: "https://images.pexels.com/photos/1717969/pexels-photo-1717969.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
//     path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3",
//   },
// ];
console.log(slider.style)
function random_bg_color() {

  // Get a number between 64 to 256 (for getting lighter colors)
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;

  // Construct a color withe the given values
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";

  // Set the background to that color
  document.body.style.background = bgColor;
}


function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  // curr_track.load();

  // track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
  // track_name.textContent = track_list[track_index].name;
  // track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  updateTimer = setInterval(seekUpdate, 10);
  curr_track.addEventListener("ended", pauseTrack());
  random_bg_color();
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  slider.value = 0;
}

function mark(){
  let curr_time = curr_track.currentTime;
  pinned.push(curr_time);
  pinned = pinned.sort((a, b) => a - b);
  console.log(pinned);
  pin_num += 1;
  pinned.forEach(draw);
  
}

function draw(item, index) {
  if (index == 0) {
    console.log(index)
    let curr_progress = Math.floor(item*(rightpx-leftpx+1)/duration); 
    strings = "<a href = \"#a"+ (index+1).toString(10) +"\" onclick=\"jump(event)\">"+
    "<i id = " + (index+1).toString(10) + " class=\"fas fa-map-marker\">"+
    "<span class=\"hw\">"+
    + (Math.round(item*100)/100).toString(10) +"</span></i>"+
    "</a>" ;
    document.getElementById("markbar").innerHTML = strings
    document.getElementById((index+1).toString(10)).style.position = "absolute";
    document.getElementById((index+1).toString(10)).style.left = (curr_progress+74).toString(10) + "px";
    document.getElementById((index+1).toString(10)).style.transform = "scale(0.7,1)";
    document.getElementById((index+1).toString(10)).style.color = "rgb(223,16,16)";
    table_str = "<tr><th>No.</th><th>Time</th><th>Pos</th></tr>" + "<tr id = t"+ (index+1).toString(10) + "><td>"+
    (index+1).toString(10)+
    "<a id = a"+ (index+1).toString(10) +"></a>" + 
    "</td><td>"+ (Math.round(item*100)/100).toString(10)+ 
    "</td><td><textarea class=\"in\" id=i" + 
    (index+1).toString(10) +"></textarea></td>"+
    "<td><i class=\"fas fa-trash-alt\" id=\"d"+(index+1).toString(10)+
    "\" onclick = \"deletepin(event)\"" +
    "></i></td>"+
    "</tr>";
    document.getElementById("tbl").innerHTML = table_str
    // console.log(document.getElementById("tbl").innerHTML)
  }
  else {
    console.log(index)
    let curr_progress = Math.floor(item*(rightpx-leftpx+1)/duration);
    strings = "<a href = \"#a"+ (index+1).toString(10) +"\" onclick=\"jump(event)\">"+
    "<i id = " + (index+1).toString(10) + " class=\"fas fa-map-marker\">"+
    "<span class=\"hw\">"+
    + (Math.round(item*100)/100).toString(10) +"</span></i>"+
    "</a>" ;
    document.getElementById("markbar").innerHTML += strings
    document.getElementById((index+1).toString(10)).style.position = "absolute";
    document.getElementById((index+1).toString(10)).style.left = (curr_progress+74).toString(10) + "px";
    document.getElementById((index+1).toString(10)).style.transform = "scale(0.7,1)";
    document.getElementById((index+1).toString(10)).style.color = "rgb(223,16,16)";
    table_str = "<tr id = t"+ (index+1).toString(10) + "><td>"+
    (index+1).toString(10)+
    "<a id = a"+ (index+1).toString(10) +"></a>" + 
    "</td><td>"+ (Math.round(item*100)/100).toString(10)+ 
    "</td><td><textarea class=\"in\" id=i" + 
    (index+1).toString(10) +"></textarea></td>"+
    "<td><i class=\"fas fa-trash-alt\" id=\"d"+(index+1).toString(10)+
    "\" onclick = \"deletepin(event)\"" +
    "></i></td>"+
    "</tr>";
    document.getElementById("tbl").innerHTML += table_str
  }

}
// Load the first track in the tracklist
let duration;
// loadTrack(track_index);
audio_file.onchange = function() {
  var file = this.files[0]
  var reader = new FileReader();
  var context = new(window.AudioContext || window.webkitAudioContext)();
  reader.onload = function() {
    context.decodeAudioData(reader.result, function(buffer) {
      duration = buffer.duration;
      console.log(buffer.duration);
      console.log(duration); 
    });
  };
  reader.readAsArrayBuffer(file);
  // console.log(this.files[0]);
  // let curr_track = document.createElement('audio');
  // console.log(URL.createObjectURL(this.files[0]));
  curr_track.src = URL.createObjectURL(this.files[0]);
  curr_track.load();
  // curr_track.play();
  clearInterval(updateTimer);
  resetValues();
  updateTimer = setInterval(seekUpdate, 10);
}
// console.log(curr_track);

function stopUpdate() {
  isUpdating = false;
}
function startUpdate() {
  isUpdating = true;
}

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fas fa-play"></i>';;
}
function deletepin(e) {
  pinned.splice(parseInt(e.target.id.slice(1))-1,1);
  // console.log(new_pinned)
  if (pinned.length > 0) 
  {
    pinned.forEach(draw);
  }
  else {
    document.getElementById("tbl").innerHTML = '';
    document.getElementById("markbar").innerHTML = '';
  }
  
}

function jump(e) {
  console.log("hi")
  document.getElementById("t"+e.target.id).style.backgroundColor = "rgb(100,200,200)";
  setTimeout(function() { 
    console.log("bye");
    document.getElementById("t"+e.target.id).style.backgroundColor = "";
  }, 1000);
}

function submit_data(){
  for (let idx = 0; idx < pinned.length; idx++) {
    output.push([pinned[idx],document. getElementById("i"+(idx+1).toString(10)).value]);
    console.log(output);
  }


  output.forEach((row, ind) => {
    const properValues = [row[0], row[1]];
    return (csvText += `${properValues.join(',')}\r\n`);
  });

  console.log(csvText);
  let link = document.createElement('a');
  link.id = 'download-csv';
  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvText));
  link.setAttribute('download', 'yourfiletextgoeshere.csv');
  document.body.appendChild(link);
  document.querySelector('#download-csv').click();
  // console.log(document.getElementById("i1").value)
}


// function nextTrack() {
//   if (track_index < track_list.length - 1)
//     track_index += 1;
//   else track_index = 0;
//   loadTrack(track_index);
//   playTrack();
// }

// function prevTrack() {
//   if (track_index > 0)
//     track_index -= 1;
//   else track_index = track_list.length;
//   loadTrack(track_index);
//   playTrack();
// }

function seekTo() {
  let seekto = duration * (slider.value / 100001);
  curr_track.currentTime = seekto;
}

// function setVolume() {
//   curr_track.volume = volume_slider.value / 100;
// }

function seekUpdate() {
  if (isUpdating) {
    let seekPosition = 0;

    if (!isNaN(duration)) {
      seekPosition = curr_track.currentTime * (100001 / duration);

      slider.value = seekPosition;

      let currentMinutes = Math.floor(curr_track.currentTime / 60);
      let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
      let durationMinutes = Math.floor(duration / 60);
      let durationSeconds = Math.floor(duration - durationMinutes * 60);

      if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
      if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
      if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
      if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

      curr_time.textContent = currentMinutes + ":" + currentSeconds;
      total_duration.textContent = durationMinutes + ":" + durationSeconds;
    }
  }
}


