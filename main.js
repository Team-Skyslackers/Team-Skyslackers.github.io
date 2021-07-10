
var firebaseConfig = {
  apiKey: "AIzaSyC4gdo6gFSc_W90EBkoMNieCRqttQZ2zWw",
  authDomain: "test-7f7c0.firebaseapp.com",
  projectId: "test-7f7c0",
  storageBucket: "test-7f7c0.appspot.com",
  databaseURL: "https://test-7f7c0-default-rtdb.asia-southeast1.firebasedatabase.app/",
  messagingSenderId: "531047203297",
  appId: "1:531047203297:web:e005e20157956859bb12a0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var currentUser = {};
DB = firebase.database();

function getUTCDateAndTime(){
  // example: 2021-07-03T09:28:49
  var d = new Date();
  return d.getUTCFullYear().toString().padStart(4, '0') + '-' + (d.getUTCMonth()+1).toString().padStart(2, '0') + '-' + d.getUTCDate().toString().padStart(2, '0') + 'T' +
  d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0') + ':' + d.getUTCSeconds().toString().padStart(2, '0');
}

// Register function
function RegisterUser(email, password, confirmPassword){
  if (password != confirmPassword){
      alert("Confirm password does not match.");
  } else {
      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
          // Signed in 
          var user = userCredential.user;

          console.log("Successfully registered new user");
          DB.ref('users/'+user.uid).set({
              userEmail: email,
              registerDateAndTimeUTC: getUTCDateAndTime()
          });
      })
      .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;

          alert(errorMessage);
      });
  }
}

// Login function
function SigninUser(email, password){
  firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          // Signed in
          var user = userCredential.user;

          console.log("Successfully signed in");
      })
      .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;

          alert(errorMessage);
      });
}

// Google signin function
var provider = new firebase.auth.GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
function GoogleSignin(){
  firebase.auth()
  .signInWithPopup(provider)
  .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
  }).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
  });
}

// Logout function
function SignOut(){
  firebase.auth().signOut()
  .then(() => {
      console.log("Succesfully signed out");
  })
  .catch((error) => {
      console.log(error.message);
  });
}

// Change in authentication state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      currentUser = user;

      // update user last signin time
      var d = new Date();
      DB.ref('users/' + user.uid).update({
          lastLoginDateAndTimeUTC: getUTCDateAndTime()
      });

      // ws.send("uid:" + user.uid);

      $("#signin-form").addClass("d-none");
      $("#registration-form").addClass("d-none");
      $("#signout-form").removeClass("d-none");

      console.log(user.email + " has signed in");
      // ...
  } else {
      // User is signed out
      // ...
      currentUser = {};
      $("#signin-form").removeClass("d-none");
      $("#registration-form").addClass("d-none");
      $("#signout-form").addClass("d-none");

      console.log("No user signed in")
  }
});

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


