
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

      // set welcome text
      $("#welcome-text").text("Hi, "+currentUser.email);

      $("#signin-form").addClass("d-none");
      $("#registration-form").addClass("d-none");
      $("#signout-form").removeClass("d-none");
      $("#music-editor").removeClass("d-none");

      console.log(user.email + " has signed in");
      // ...
  } else {
      // User is signed out
      // ...
      currentUser = {};
      $("#signin-form").removeClass("d-none");
      $("#registration-form").addClass("d-none");
      $("#signout-form").addClass("d-none");
      $("#music-editor").addClass("d-none");

      console.log("No user signed in")
  }
});

let playpause_btn = document.querySelector(".playpause-track");
let slider = $("#music-slider");
let curr_time = $("#current-time");
let total_duration = $("#total-duration");

let track_index = 0;
let isPlaying = false;
let isUpdating = true;
let updateTimer;
// let duration;
// Create new audio element
let curr_track = document.createElement('audio');
let pinned = [];
let history = [];
let output = [];
let csvText = '';
let markerPinHTML = "";
let markerTableHTML = "";
let pin_num = 0;



function resetValues() {
  curr_time.text("00:00");
  total_duration.text("00:00");
  slider.val(0);
}

function mark(){
  let curr_time = curr_track.currentTime;
  pinned.push(curr_time);
  history.push(curr_time);
  pinned = pinned.sort((a, b) => a - b);
  // console.log(pinned);
  pin_num += 1;
  pinned.forEach(draw);
  
}

function draw(item, index) {
  let leftpx = $("#music-slider").position().left;
  let rightpx = leftpx + $("#music-slider").width();
  let pin_pos = item/duration * (rightpx-leftpx) + leftpx;
  
  let ct_pos = leftpx - 20;

  $("#current-time").css({
    left: "20px",
    top: $("#music-slider").position().top + "px"
  })
  // $("#total-duration").css({
  //   position: 'absolute'
  // })

  markerPinHTML = "<a  id = " + (index+1).toString(10) + " href = \"#a"+ 
    (index+1).toString(10) +"\" onclick=\"jump(event)\">"+ "<i class=\"fas fa-map-marker\">"+
    "<span class=\"hw\">"+ (Math.round(item*100)/100).toString(10) +"</span></i>"+"</a>" ;
  if (index == 0) {
    $("#markbar").html("");
    $("#tbl").html("<tr><th>No.</th><th>Time</th><th>Pos</th><th>Delete</th></tr>");
  }
  $("#markbar").append(markerPinHTML);
  $('#'+(index + 1)).css({
    position: 'absolute',
    left: pin_pos - $('#'+(index + 1)).width()/2 + "px",
    top: $('#music-slider').position().top - $('#'+(index + 1)).height() + "px",
    transform: "scale(0.7,1)",
    color: "rgb(223,16,16)"
  })
  markerTableHTML = "<tr id = t"+ (index+1).toString(10) + "><td width=\"200px\">"+(index+1).toString(10)+
    "<a id = a"+ (index+1).toString(10) +"></a>" + "</td><td width=\"200px\">"+ (Math.round(item*100)/100).toString(10)+ 
    "</td><td><input id=i" + (index+1).toString(10) +"></input></td>"+
    "<td><i class=\"fas fa-trash-alt\" id=\"d"+(index+1).toString(10)+
    "\" onclick = \"deletepin(event)\"" + "></i></td>"+ "</tr>";
  $("#tbl").append(markerTableHTML);
}
// Load the first track in the tracklist
let duration;
var file;
// loadTrack(track_index);
audio_file.onchange = function() {
  file = this.files[0]
  var reader = new FileReader();
  var context = new(window.AudioContext || window.webkitAudioContext)();
  reader.onload = function() {
    context.decodeAudioData(reader.result, function(buffer) {
      duration = buffer.duration;
    });
  };
  reader.readAsArrayBuffer(file);
  // let curr_track = document.createElement('audio');
  curr_track.src = URL.createObjectURL(this.files[0]);
  curr_track.load();
  // curr_track.play();
  clearInterval(updateTimer);
  resetValues();
  updateTimer = setInterval(seekUpdate, 10);
}

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
  console.log(history);
  let time_sel;
  time_sel = pinned[parseInt(e.target.id.slice(1))-1];
  console.log(time_sel);
  pinned.splice(parseInt(e.target.id.slice(1))-1,1);
  history.splice(history.indexOf(time_sel),1); 
  console.log(history);
  // console.log(new_pinned)
  if (pinned.length > 0) 
  {
    pinned.forEach(draw);
  }
  else {
    $("#tbl").html("");
    $("#markbar").html("");
  }
  
}

function jump(e) {
  document.getElementById("t"+e.target.offsetParent.id).style.backgroundColor = "rgb(100,200,200)";
  setTimeout(function() { 
    console.log("bye");
    document.getElementById("t"+e.target.offsetParent.id).style.backgroundColor = "";
  }, 1000);
}

async function submit_data(){

  for (let idx = 0; idx < pinned.length; idx++) {
    output.push([pinned[idx],document.getElementById("i"+(idx+1).toString(10)).value]);
  }


  output.forEach((row, ind) => {
    const properValues = [row[0], row[1]];
    return (csvText += `${properValues.join(',')}\r\n`);
  });

  console.log(csvText);
  window.URL = window.webkitURL || window.URL;
  var contentType = 'text/csv';
  var csvFile = new Blob([csvText], {type: contentType});
  const ref1 = firebase.storage().ref().child('musicFile/map.csv');
  // [START storage_upload_blob]
  // 'file' comes from the Blob or File API
  ref1.put(csvFile).then((snapshot) => {
    console.log('Uploaded a blob or file!');
  });
  const ref2 = firebase.storage().ref().child('musicFile/song.csv');
  // [START storage_upload_blob]
  // 'file' comes from the Blob or File API
  ref2.put(file).then((snapshot) => {
    console.log('Uploaded a blob or file!');
  });
  let map_url;
  let song_url
  const p1 = ref1.getDownloadURL();
  await p1.then((url)=> {
    // console.log(url);
    map_url = url;
  });
  const p2 = ref2.getDownloadURL();
  await p2.then((url)=>{
    // console.log(url);
    song_url = url;
  });
  // console.log(map_url);
  // console.log(song_url);
  console.log(currentUser.uid);
  DB.ref('songs/'+document.getElementById("name").value).set({
    details: {
      author: currentUser.uid,
      creationTime: getUTCDateAndTime()
    },
    
    difficulty: document.getElementById("LOD").value,

    storageLink: {
      csv: map_url,
      mp3: song_url
    },

    title: document.getElementById("name").value

  })
  alert("Song and map submitted");
  location.reload();
}

function seekTo() {
  let seekto = duration * (slider.val() / 100001);
  curr_track.currentTime = seekto;
}

function seekUpdate() {
  if (isUpdating) {
    let seekPosition = 0;

    if (!isNaN(duration)) {
      seekPosition = curr_track.currentTime * (100001 / duration);

      slider.val(seekPosition)

      let currentMinutes = Math.floor(curr_track.currentTime / 60);
      let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
      let durationMinutes = Math.floor(duration / 60);
      let durationSeconds = Math.floor(duration - durationMinutes * 60);

      if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
      if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
      if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
      if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

      curr_time.text(currentMinutes + ":" + currentSeconds);
      total_duration.text(durationMinutes + ":" + durationSeconds);
    }
  }
}

function undo() {
  console.log(history);
  if (history.length > 0) {
    let prev_pin;
    prev_pin = history.pop();
    pinned.splice(pinned.indexOf(prev_pin),1); 
    // console.log(new_pinned)
    if (pinned.length > 0) 
    {
      pinned.forEach(draw);
    }
    else {
      $("#tbl").html("");
      $("#markbar").html("");
    }
  }
}

