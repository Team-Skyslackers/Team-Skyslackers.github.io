
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

// Press tab to go to next input
$(".inputs").keyup(e => {
  if (e.keyCode === 9) $(this).next('.inputs').focus();
});

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

// Send reset password email
function ResetPasswordViaEmail(){
  firebase.auth().sendPasswordResetEmail($("#inputEmail").val())
      .then(() => {
          alert("Password reset email sent!\nPlease check your inbox.");
          // Password reset email sent!
          // ..
      })
      .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage);
          // ..
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
let songlistHTML = "";
let max_pin_num = 0;
var result = {};


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
  max_pin_num += 1;
  pinned.forEach(draw);

  // get current pin number
  var cur_pin = pinned.indexOf(curr_time) + 1;
  
  // Jump to the new entry
  document.getElementById("t"+cur_pin).style.backgroundColor = "rgb(100,200,200)";
  $("#tbl_card").scrollTop($("#t"+cur_pin).position().top);

  setTimeout(function() { 
    console.log("bye");
    document.getElementById("t"+cur_pin).style.backgroundColor = "";
  }, 1000);
}

function draw(item, index) {
  let leftpx = $("#music-slider").position().left;
  let rightpx = leftpx + $("#music-slider").width();
  let pin_pos = item/duration * (rightpx-leftpx) + leftpx;
  console.log(duration);
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
    $("#tbl").html("\
    <tr>\
      <th style='width: 30%'>No.</th>\
      <th style='width: 30%'>Time</th>\
      <th style='width: 30%'>Pos</th>\
      <th style='width: 10%'>Delete</th>\
    </tr>");
  }
  $("#markbar").append(markerPinHTML);
  $('#'+(index + 1)).css({
    position: 'absolute',
    left: pin_pos - $('#'+(index + 1)).width()/2 + "px",
    top: $('#music-slider').position().top - $('#'+(index + 1)).height() + "px",
    transform: "scale(0.7,1)",
    color: "rgb(223,16,16)"
  })
  console.log(result);
  console.log(result[item]);
  let value = (result[item]==undefined)? '':result[item];
  markerTableHTML = "<tr id = t"+ (index+1).toString(10) + "><td width=\"200px\">"+(index+1).toString(10)+
    "<a id = a"+ (index+1).toString(10) +"></a>" + "</td><td width=\"200px\">"+ (Math.round(item*100)/100).toString(10)+ 
    "</td><td><input type=\"text\" id=\"i" + (index+1).toString(10) + "\" value =" + value +"></input></td>"+
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
  document.getElementById("playbtn").onclick = playpauseTrack;
  document.getElementById("playbtn").style.cursor = "pointer";
  document.getElementById("undobtn").onclick = undo;
  document.getElementById("undobtn").style.cursor = "pointer";
  document.getElementById("markbtn").onclick = mark;
  document.getElementById("markbtn").style.cursor = "pointer";
  document.getElementById("submitbtn").onclick = submit_data;
  document.getElementById("submitbtn").style.cursor = "pointer";
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
  // console.log(document.getElementById("LOD").value);
  if (document.getElementById("name").value == '' || document.getElementById("LOD").value == '' ) {
    alert("Please fill in all details and submit again.")
  }
  else {
    let repeat = 0;
    console.log(document.getElementById("name").value);
    await DB.ref('songs').orderByChild('title').equalTo(document.getElementById("name").value).get().then(snapshot => {
      console.log(snapshot.exists());
      if (snapshot.exists()){
        repeat = 1;
        alert("Map name already exists. Try a new one.");
      }
    });
    //if no repeat, can proceed
    if (repeat != 1) { 
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
      const ref1 = firebase.storage().ref().child('musicFile/'+document.getElementById("name").value+'_map.csv');
      // [START storage_upload_blob]
      // 'file' comes from the Blob or File API
      await ref1.put(csvFile).then((snapshot) => {
        console.log('Uploaded a blob or file!');
      });
      const ref2 = firebase.storage().ref().child('musicFile/'+document.getElementById("name").value+'_song.mp3');
      // [START storage_upload_blob]
      // 'file' comes from the Blob or File API
      await ref2.put(file).then((snapshot) => {
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
        }
      })
      alert("Song and map submitted");
      location.reload();
    }

  }
 
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

async function openTab(event,tabname) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabname).style.display = "block";
  event.currentTarget.className += " active";
}

async function Loadlist(){
  $('#songlist').html("<option value = 0>Choose a map below</option>");
  await DB.ref('songs').orderByChild('details/author').equalTo(currentUser.uid).get().then(snapshot => {
    snapshot.forEach(t=>{
      songlistHTML = "<option value = \""+
      t.key+
      "\">" + t.key + "</option>";
      $('#songlist').append(songlistHTML);
    });
  });
}

async function LoadSong(){
  let songinfo;
  console.log(document.getElementById('songlist').value);
  await DB.ref('songs').orderByKey().equalTo(document.getElementById('songlist').value).get().then(snapshot => {
    console.log(snapshot.toJSON());
    songinfo = snapshot.toJSON();
    
  });
  curr_track.setAttribute("preload","metadata");
  curr_track.src = songinfo[document.getElementById('songlist').value].storageLink.mp3;
  // curr_track.src = songinfo.valueOf(songinfo.key).storageLink.mp3;
  curr_track.onloadedmetadata = function() {
    duration = curr_track.duration;
  };
  curr_track.load();
    // curr_track.play();
  clearInterval(updateTimer);
  resetValues();
  updateTimer = setInterval(seekUpdate, 10);
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  let blob;
  xhr.open('GET', songinfo[document.getElementById('songlist').value].storageLink.csv);
  xhr.onreadystatechange = handleStateChange;
  xhr.send();
  function handleStateChange() {
    if (xhr.readyState == 4 &&
        xhr.status >= 200 &&
        xhr.status < 300) {
      blob = xhr.response;
      console.log(blob);
      xhr.abort();
    }
  }
  setTimeout(function(){
    blob.text().then(res=>{
      console.log(res);
      let rawdata = res.split(/\r\n|\n/).slice(0, -1);
      console.log(rawdata);
      pinned = rawdata.map(x=>parseFloat(x.split(',')[0]));
      console.log(pinned);
      output = rawdata.map(x=>x.split(',')[1]);
      console.log(output);
      pinned.forEach(draw);
      output.forEach((item, index)=> {
        document.getElementById("i"+(index+1).toString(10)).value = item;
      })

      result =  output.reduce(function(result, field, index) {
        result[pinned[index]] = field;
        return result;
      }, {})
      document.getElementById('name').value = document.getElementById('songlist').value;
      document.getElementById('name').disabled = true;
      document.getElementById('name').disabled = true;
      document.getElementById('LOD').value = songinfo[document.getElementById('songlist').value].difficulty;
    });
  },1000);
  // var xhr = new XMLHttpRequest();
  // xhr.responseType = 'blob';
  // let blob;
  // xhr.open('GET', songinfo[document.getElementById('songlist').value].storageLink.csv);
  // xhr.onload = (event) => {
  //   blob = xhr.response;
  // };
  // xhr.send();
  // setTimeout(function() {
  //   xhr.abort();
  //   console.log(blob);
  // }, 300)
 
  // blob.text().then(res=>{
  //   console.log(res);
  //   let rawdata = res.split(/\r\n|\n/).slice(0, -1);
  //   console.log(rawdata);
  //   pinned = rawdata.map(x=>parseFloat(x.split(',')[0]));
  //   console.log(pinned);
  //   output = rawdata.map(x=>x.split(',')[1]);
  //   console.log(output);
  //   pinned.forEach(draw);
  //   output.forEach((item, index)=> {
  //     document.getElementById("i"+(index+1).toString(10)).value = item;
  //   })
  // });

  $('#mapeditor').append($('.player')[0]);
  $('#mapeditor').append($('#tbl_card'));
  $('#mapeditor').append($('#data'));

  $('#buttons').html('');
  $('#buttons').append('<button id = \'updatebtn\' class = \"btn btn-primary\" onclick=\"update_curr()\">UPDATE</button>')
  $('#buttons').append('<button id = \'deletebtn\' class = \"btn btn-primary\" onclick=\"delete_curr()\">DELETE</button>')
  $("#deletebtn").css({
    backgroundColor: "rgb(223,16,16)",
    border: "1px solid rgb(223,16,16)"
  })
  document.getElementById("playbtn").onclick = playpauseTrack;
  document.getElementById("playbtn").style.cursor = "pointer";
  document.getElementById("undobtn").onclick = undo;
  document.getElementById("undobtn").style.cursor = "pointer";
  document.getElementById("markbtn").onclick = mark;
  document.getElementById("markbtn").style.cursor = "pointer";

  // console.log(map.value);
}
async function delete_curr() {

  DB.ref('songs/'+document.getElementById("name").value).remove(e => {
    console.log(e);
  });
  const ref1 = firebase.storage().ref().child('musicFile/'+document.getElementById("name").value+'_map.csv');
  await ref1.delete().then((snapshot) => {
    console.log('deleted!');
  });
  const ref2 = firebase.storage().ref().child('musicFile/'+document.getElementById("name").value+'_song.mp3');
  // [START storage_upload_blob]
  // 'file' comes from the Blob or File API
  await ref2.delete().then((snapshot) => {
    console.log('deleted!');
  });
  alert("Song and map deleted!")
  location.reload();
}

async function update_curr() {
  let song_url;
  await DB.ref('songs').orderByKey().equalTo(document.getElementById("name").value).get().then(snapshot => {
    song_url = snapshot.toJSON()[document.getElementById('songlist').value].storageLink.mp3;
    console.log(song_url);
  });
  output = [];
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
  const ref1 = firebase.storage().ref().child('musicFile/'+document.getElementById("name").value+'_map.csv');
  // [START storage_upload_blob]
  // 'file' comes from the Blob or File API
  await ref1.put(csvFile).then((snapshot) => {
    console.log('Uploaded a blob or file!');
  });
  let map_url;
  const p1 = ref1.getDownloadURL();
  await p1.then((url)=> {
    // console.log(url);
    map_url = url;
  });
  // console.log(map_url);
  // console.log(song_url);
  console.log(currentUser.uid);
  
  DB.ref('songs/'+document.getElementById("name").value).update({
    difficulty: document.getElementById("LOD").value,

    storageLink: {
      csv: map_url,
      mp3: song_url
    }
  })
  alert("Map updated");
  location.reload();

}

