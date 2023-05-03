// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyAHthZ5KFcB6TMxYjDEPW-gAX-cz0fjQh0",
  authDomain: "cooperative-a3cf7.firebaseapp.com",
  databaseURL: "https://cooperative-a3cf7-default-rtdb.firebaseio.com",
  projectId: "cooperative-a3cf7",
  storageBucket: "cooperative-a3cf7.appspot.com",
  messagingSenderId: "1003828300769",
  appId: "1:1003828300769:web:090b9fd657e5f6f5e320a0",
  measurementId: "G-K11FBM7RHK",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

/*----------------------------------------------------------------index ------------------------------------------------------------------------------------------------*/

/*----------------------------------------
                        register
    ------------------------------------------*/
function reg() {
  let userEmail = document.getElementById("email").value;
  let secUserEmail = document.getElementById("secEmail").value;

  let userPass = document.getElementById("user_password").value;
  let secUserPass = document.getElementById("confirm_password").value;

  // case the Email and password is not the same in all the textboxs
  if (userEmail != secUserEmail || userPass != secUserPass) {
    alert("email or password is incorrect");
    return;
  }

  // case user didnt press the checkbox
  if (!$("#terms").is(":checked")) {
    $("#email").val("");
    $("#secEmail").val("");
    $("#user_password").val("");
    $("#confirm_password").val("");
    alert("you must agree to terms of service");
    return;
  }

  // case user already exist
  firebase
    .auth()
    .signInWithEmailAndPassword(userEmail, userPass)
    .then(function (firebaseUser) {
      alert(firebaseUser.user.uid);
      alert("user alrady exist");
      return;
    });

  // make a new user
  const email = userEmail;
  const password = userPass;
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User account created successfully
      const user = userCredential.user;

      alert("user created");
      $("#email").val("");
      $("#secEmail").val("");
      $("#user_password").val("");
      $("#confirm_password").val("");

      // send email verification
      user.sendEmailVerification();

      const userData = {
        uid: user.uid,
        first_name: "user",
        last_name: "user",
        email: email,
        phone: "000-000000000",
        image_url: "../images/user.png",
        rate: "0",
        review: "0",
      };

      // create user on database
      firebase
        .database()
        .ref("users/" + user.uid)
        .set(userData);
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
}

/*----------------------------------------
                        login
    ------------------------------------------*/
function login() {
  var userEmail = document.getElementById("username").value;
  var userPass = document.getElementById("password").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(userEmail, userPass)
    .then(function (firebaseUser) {
      // check if email address has been verified
      if (!firebaseUser.user.emailVerified) {
        const result = window.confirm(
          "email address has not been verified, resend email verification?"
        );
        if (result) firebaseUser.user.sendEmailVerification();
        return;
      }
      // check if we can use local storage
      if (typeof Storage !== "undefinde") {
        localStorage.userID = firebaseUser.user.uid;
        localStorage.email = firebaseUser.user.email;
        localStorage.p = userPass;

        // check if "Remember Me" is checked
        if ($("#remember").is(":checked")) {
          // Set expiration date of 24 hours from now
          const expirationMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          const expirationDate = new Date(
            Date.now() + expirationMs
          ).toUTCString();
          sessionStorage.setItem("expiration", expirationDate);
        }

        window.location.href = "htmls/home.html";
        // case we cant use local storage
      } else {
        alert("Soory, your browser dose not support web storage");
        return;
      }
    })

    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (
        errorMessage ===
        "There is no user record corresponding to this identifier. The user may have been deleted."
      ) {
        alert("user dos not exsit");
        $("#username").val("");
        $("#password").val("");
        return;
      }

      // case exsist
      else {
        alert("email or password incorrect");
      }

      // ...
    });
}

/*----------------------------------------
                    check session
    ------------------------------------------*/
function checkSession() {
  const now = new Date().toUTCString();
  const expiration = sessionStorage.getItem("expiration");
  //case session expired remove data of user
  if ((expiration && now > expiration) || expiration == null) {
    // The item has expired, so remove it
    sessionStorage.removeItem("expiration");
    localStorage.removeItem("userID");
    localStorage.removeItem("email");
    localStorage.removeItem("p");
  }

  // case not expired session
  else {
    window.location.href = "htmls/home.html";
  }
}

/*----------------------------------------
                  forgot password
    ------------------------------------------*/
function forgotPassword() {
  var userEmail = document.getElementById("username").value;

  if (userEmail == "") alert("please enter an email");
  else {
    firebase.auth().sendPasswordResetEmail(userEmail);
    $("#username").val("");
    alert("email was sent");
  }
}

/*----------------------------------------
                        logout
    ------------------------------------------*/
function logout() {
  sessionStorage.removeItem("expiration");
  localStorage.removeItem("userID");
  localStorage.removeItem("email");
  localStorage.removeItem("p");
  window.location.href = "../index.html";
}

/*----------------------------------------
                        guest checker
    ------------------------------------------*/
function guestCheck() {
  if (!localStorage.getItem("userID")) window.location.href = "../index.html";
}

/*----------------------------------------------------------------dashbord ------------------------------------------------------------------------------------------------*/
/*----------------------------------------
                        show dashboard
    ------------------------------------------*/
function showDashbordDetails() {
  const usersRef = firebase.database().ref("users");
  const userRef = usersRef.child(localStorage.getItem("userID"));
  userRef.once("value").then((snapshot) => {
    const firstName = snapshot.val().first_name;
    const imageUrl = snapshot.val().image_url;
    let profileImageStr = `<img src="${imageUrl}" alt="${firstName}" width="512" height="512"/>`;
    let hiUserStr = `<h4 class="name">Hi, ${firstName}!</h4>`;
    $(".account-img").append(profileImageStr);
    $("#hi_user").append(hiUserStr);
  });
}

/*----------------------------------------------------------------my profile ------------------------------------------------------------------------------------------------*/

/*----------------------------------------
                        on load function
    ------------------------------------------*/
function onloadMyProfile() {
  guestCheck();
  showDashbordDetails();
  showProfileDetails();
  showUserListingDetails();
}

/*----------------------------------------
                        show profile details
    ------------------------------------------*/
function showProfileDetails() {
  const usersRef = firebase.database().ref("users");
  const userRef = usersRef.child(localStorage.getItem("userID"));
  userRef.once("value").then((snapshot) => {
    const firstName = snapshot.val().first_name;
    const lastName = snapshot.val().last_name;
    const email = snapshot.val().email;
    const phone = snapshot.val().phone;
    const rate = snapshot.val().rate;
    const imageUrl = snapshot.val().image_url;

    // create rating with stars icon
    let rateing = `<div class="ratings">`;
    let temp = ``;
    if (rate % 1 != 0) {
      temp = `<i class="ion-ios-star-half"></i>`;
    }
    for (let i = 0; i < Math.trunc(rate); i++) {
      rateing += `<i class="ion-ios-star"></i>`;
    }
    rateing += temp + `</div>`;

    let profileStr = `<li>
                <h6>First Name :</h6>
                <span>${firstName}</span>
              </li>
              <li>
                <h6>Last Name :</h6>
                <span>${lastName}</span>
              </li>
              <li>
                <h6>Email:</h6>
                <span>${email}</span>
              </li>
              <li>
                <h6>Phone :</h6>
                <span>${phone}</span>
              </li>
              <li>
                <h6>Rate :</h6>
                <span>${rateing}</span>
              </li>`;
    $(".db-profile-info").append(profileStr);
  });
}

/*----------------------------------------
                show user listing details
    ------------------------------------------*/
function showUserListingDetails() {
  const listingsRef = firebase.database().ref("listings");
  const userListRef = listingsRef.child(localStorage.getItem("userID"));
  userListRef.once("value").then((snapshot) => {
    let listing = ``;
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      if (typeof childData == "object") {
        const email = childSnapshot.val().email;
        const phone = childSnapshot.val().phone;
        const price = childSnapshot.val().price;
        const description = childSnapshot.val().description;
        const title = childSnapshot.val().type_point;
        const location = childSnapshot.val().location;

        listing += `
        <div class="most-viewed-item">
          <div class="most-viewed-detail">
            <h3><a>${title}</a></h3>
            <p class="list-address"><i class="icofont-google-map"></i>${location}</p>
            <p class="list-address"><i class="ion-ios-telephone"></i>${phone}</p>
            <p class="list-address"><i class="ion-ios-email"></i>${email}</p>
            <p class="list-address"><i class="ion-social-bitcoin"></i>${price}</p>
            <p class="list-address"><i class="ion-document"></i>${description}</p>
          </div>
          <div class="listing-button">
            <a class="btn v5" onclick="deleteUserListing('${title}')"><i class="ion-android-delete"></i> Delete</a>
          </div>
        </div>`;
      }
    });
    console.log(listing);
    $(".iteams").append(listing);
  });
}

/*----------------------------------------
                  delete user listing
    ------------------------------------------*/
function deleteUserListing(lisingTitle) {
  firebase
    .database()
    .ref("listings/" + localStorage.getItem("userID") + "/" + lisingTitle)
    .remove();

  setTimeout(() => {
    window.location.reload();
  }, 500);
}

/*----------------------------------------------------------------edit profile ------------------------------------------------------------------------------------------------*/

/*----------------------------------------
                        on load function
    ------------------------------------------*/
function onloadEditprofile() {
  guestCheck();
  showDashbordDetails();
}

/*----------------------------------------
                  edit profile
    ------------------------------------------*/
function editProfile() {
  // upload image
  const storage = firebase.storage();
  // Get a reference to the file that you want to upload
  const file = document.getElementById("photo-upload").files[0];
  //check if user select image
  if (file != undefined) {
    // Get a reference to the location in Firebase Storage where you want to upload the file
    const storageRef = storage
      .ref()
      .child("profile images/" + localStorage.getItem("userID") + ".png");

    // Upload the file to Firebase Storage
    const uploadTask = storageRef.put(file);

    // Monitor the progress of the upload
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Handle progress updates
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        // Handle errors
        console.error("Error uploading file:", error);
      },
      () => {
        // Handle successful uploads
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("File available at", downloadURL);
          const ref = database.ref("users/" + localStorage.getItem("userID"));
          ref.update({
            image_url: downloadURL,
          });
        });
      }
    );
  }

  const database = firebase.database();
  // Get a reference to the node you want to update
  const ref = database.ref("users/" + localStorage.getItem("userID"));
  var name = document.getElementById("edit_first_name").value;
  var lastName = document.getElementById("edit_last_name").value;
  var email = document.getElementById("edit_email").value;
  var phone = document.getElementById("edit_phone").value;

  var password = document.getElementById("edit_password").value;
  var password2 = document.getElementById("edit_confirm_password").value;
  if (password == password2 && password != "") {
    firebase
      .auth()
      .signInWithEmailAndPassword(
        localStorage.getItem("email"),
        localStorage.getItem("p")
      )
      .then(function (userCredential) {
        userCredential.user.updatePassword(password);
      });
  } else if (password != password2) {
    alert("passwords are not much");
    $("#edit_first_name").val("");
    $("#edit_last_name").val("");
    $("#edit_email").val("");
    $("#edit_phone").val("");
    $("#edit_password").val("");
    $("#edit_confirm_password").val("");
    return;
  }

  if (name == "") {
    name = "user";
  }

  if (lastName == "") {
    lastName = "user";
  }

  if (email == "") {
    email = localStorage.getItem("email");
  } else if (email != "") {
    firebase
      .auth()
      .signInWithEmailAndPassword(
        localStorage.getItem("email"),
        localStorage.getItem("p")
      )
      .then(function (userCredential) {
        userCredential.user.updateEmail(email);
      });
  }

  if (phone == "") {
    phone = "000-000000000";
  }

  // Update user data
  ref.update({
    first_name: name,
    last_name: lastName,
    email: email,
    phone: phone,
  });

  // setTimeout(() => {
  //   window.location.reload();
  // }, 500);
}

/*----------------------------------------------------------------add listing ------------------------------------------------------------------------------------------------*/

/*----------------------------------------
                        on load function
    ------------------------------------------*/
function onloadAddListing() {
  guestCheck();
  showDashbordDetails();
}
/*----------------------------------------
                        add listing
    ------------------------------------------*/
function addListing() {
  const usersRef = firebase.database().ref("users");
  const userRef = usersRef.child(localStorage.getItem("userID"));
  userRef.once("value").then((snapshot) => {
    const email = snapshot.val().email;
    const rate = snapshot.val().rate;
    const review = snapshot.val().review;

    var title = document.getElementById("listingTitle").value;
    var location = document.getElementById("address").value;
    var phone = document.getElementById("add_listing_phone").value;
    var price = document.getElementById("price").value;
    var description = document.getElementById("list_info").value;

    // get latitude and longitude
    location = location.replace(" ", "%20");
    var url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=3&q=" +
      location;
    console.log(url);
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    const lat = JSON.parse(xmlHttp.responseText)[0].lat;
    const lon = JSON.parse(xmlHttp.responseText)[0].lon;

    location = location.replace("%20", " ");

    const userData = {
      phone: phone,
      rate: rate,
      review: review,
      email: email,
      userUid: localStorage.getItem("userID"),
    };

    const userData2 = {
      type_point: title,
      phone: phone,
      location_latitude: lat,
      location_longitude: lon,
      map_image_url: "../images/marker.png",
      email: email,
      location: location,
      price: price,
      description: description,
    };

    // create listing on database
    firebase
      .database()
      .ref("listings/" + localStorage.getItem("userID") + "/" + title)
      .set(userData2);

    firebase
      .database()
      .ref("listings/" + localStorage.getItem("userID"))
      .update(userData);
  });

  setTimeout(() => {
    window.location.reload();
  }, 500);
}

/*----------------------------------------------------------------home ------------------------------------------------------------------------------------------------*/
/*----------------------------------------
                        on load function
    ------------------------------------------*/
function onloadHome() {
  showAllListings();
}

/*----------------------------------------
                        show all listings
    ------------------------------------------*/

function showAllListings() {
  let numOfListings = 0;
  const listingsRef = firebase.database().ref("listings");
  listingsRef.once("value").then((snapshot) => {
    let listing = ``;
    let markers = `[`;
    snapshot.forEach((childSnapshot) => {
      const userId = childSnapshot.val().userUid;
      childSnapshot.forEach((childS2napshot) => {
        const childData = childS2napshot.val();
        if (typeof childData == "object") {
          numOfListings++;
          const email = childS2napshot.val().email;
          const phone = childS2napshot.val().phone;
          const price = childS2napshot.val().price;
          const description = childS2napshot.val().description;
          const title = childS2napshot.val().type_point;
          const location = childS2napshot.val().location;
          var rate = childSnapshot.val().rate;
          const review = childSnapshot.val().review;
          const lat = childS2napshot.val().location_latitude;
          const long = childS2napshot.val().location_longitude;

          // create rating with stars icon
          let rateing = `<div class="ratings">`;
          let temp = ``;
          if (rate % 1 != 0) {
            temp = `<i class="ion-ios-star-half"></i>`;
          }
          for (let i = 0; i < Math.trunc(rate); i++) {
            rateing += `<i class="ion-ios-star"></i>`;
          }
          rateing += temp + `</div>`;

          listing += `
            <div class="row trending-place-item">
            <div class="col-md-6 no-pad-lr">
                <div class="trending-title-box">
                    <!-- onclick new chat -->
                    <h4><a class="chat" id="${userId}" value=${numOfListings} href="messages.html?U=${userId}&V=${numOfListings}"">${title}</a></h4>
                    <div class="customer-review">
                        <div class="rating-summary float-left">
                        ${rateing}
                        </div>
                        <div class="review-summury float-right">
                            <p><a>${review} Reviews</a></p>
                        </div>
                    </div>
                    <br>
                    <ul class="trending-address">
                        <li><i class="ion-ios-location"></i>
                            <p>${location}</p>
                        </li>
                        <li><i class="ion-ios-telephone"></i>
                            <p>${phone}</p>
                        </li>
                        <li><i class="ion-ios-email"></i>
                            <p>${email}</p>
                        </li>
                        <li><i class="ion-social-bitcoin"></i>
                          <p>${price}</p>
                        </li>
                        <li><i class="ion-document"></i>
                        <p>${description}</p>
                    </li>
                    </ul>
                </div>
            </div>
        </div>`;

          markers += `
          {
            "type_point": "${title}",
            "location_latitude": "${lat}",
            "location_longitude": "${long}",
            "map_image_url": "../images/marker.png",
            "rate": "${rate}",
            "review": "${review} reviews",
            "phone": "${phone}",
            "price": "${price}",
            "description": "${description}"
          },
        `;
        }
      });
    });
    let numOfListingsStr = `<p>Showing <span>${numOfListings} of ${numOfListings}</span> Listings</p>`;
    $("#list-view").append(listing);
    $("#num_of_listing").append(numOfListingsStr);
    // markers = JSON.parse(markers);
    // console.log(markers);

    let lastIndex = markers.lastIndexOf("},");
    if (lastIndex !== -1) {
      markers = markers.substring(0, lastIndex) + "}";
    }
    markers += `
  ]`;
    initMap(markers);
  });
}

/*----------------------------------------
                        sort map
    ------------------------------------------*/

function applySearch() {
  let searchFilter = document.getElementById("search-filter").value;
  if (searchFilter == "") {
    applySearchWithOnlyLocation();
  }
}

function applySearch() {
  let searchFilter = document.getElementById("search-filter").value;
  if (searchFilter == "") {
  }
}

function applySearchWithOnlyLocation() {
  let locationFilter = document.getElementById("location-filter").value;
}

/*----------------------------------------
                        init map
    ------------------------------------------*/

function initMap(mapMarkers) {
  mapMarkers = JSON.parse(mapMarkers);
  // console.log(markers);

  var mapObject,
    markers = [],
    markersData = {
      Marker: mapMarkers,
    };

  console.log(mapObject);

  var mapOptions = {
    zoom: 15,
    center: new google.maps.LatLng(31.771959, 35.217018),
    mapTypeId: google.maps.MapTypeId.ROADMAP,

    mapTypeControl: false,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.LEFT_CENTER,
    },
    panControl: false,
    panControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
    scrollwheel: false,
    scaleControl: false,
    scaleControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
    },
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP,
    },
  };
  var marker;
  mapObject = new google.maps.Map(
    document.getElementById("map_right_listing"),
    mapOptions
  );
  for (var key in markersData)
    markersData[key].forEach(function (item) {
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          item.location_latitude,
          item.location_longitude
        ),
        map: mapObject,
        icon: "../images/marker.png",
      });

      if ("undefined" === typeof markers[key]) markers[key] = [];
      markers[key].push(marker);
      google.maps.event.addListener(marker, "click", function () {
        closeInfoBox();
        getInfoBox(item).open(mapObject, this);
        mapObject.setCenter(
          new google.maps.LatLng(
            item.location_latitude,
            item.location_longitude
          )
        );
      });
    });

  new MarkerClusterer(mapObject, markers[key]);

  function closeInfoBox() {
    $("div.infoBox").remove();
  }

  function getInfoBox(item) {
    return new InfoBox({
      content:
        '<div class="marker_info" id="marker_info">' +
        "<span>" +
        "<em>" +
        item.type_point +
        "</em>" +
        '<span class="infobox_rate">' +
        item.rate +
        "</span>" +
        '<span class="btn_infobox_reviews">' +
        item.phone +
        "</span>" +
        '<span class="btn_infobox_reviews">' +
        item.price +
        "</span>" +
        '<span class="btn_infobox_reviews">' +
        item.description +
        "</span>" +
        '<span class="btn_infobox_reviews">' +
        item.review +
        "</span>" +
        "</span>" +
        "</div>",
      pixelOffset: new google.maps.Size(10, 92),
      closeBoxMargin: "",
      closeBoxURL: "../images/close_infobox.png",
      isHidden: false,
      alignBottom: true,
      pane: "floatPane",
      enableEventPropagation: true,
    });
  }
}

/*----------------------------------------------------------------messages ------------------------------------------------------------------------------------------------*/
/*----------------------------------------
                        get element details
    ------------------------------------------*/
function getElementDetails(event) {
  event.preventDefault();
  // Get the element details
  const href = this.href;
  const title = this.title;
  const id = this.dataset.id;
  // Log the details to the console
  console.log(`row: ${value}`);
  console.log(`ID: ${id}`);
}

/*----------------------------------------
                        on load function
    ------------------------------------------*/
function onloadMessages() {
  guestCheck();
  showDashbordDetails();

  // get values from url
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("U");
  const row = urlParams.get("V");
  if (id != null) sendChat(id, true);
  else sendChat();
}

function changeClass() {
  var element2 = document.getElementById("insertMasseges");
  element2.classList.remove("au-inbox-wrap", "js-inbox-wrap");
  element2.classList.add("au-inbox-wrap", "js-inbox-wrap", "show-chat-box");
}

function sendChat(newChat) {
  var str = ``;
  const listingsRef = firebase.database().ref("chats");
  listingsRef.once("value").then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      if (localStorage.getItem("userID") == childSnapshot.key) {
        childSnapshot.forEach((childS2napshot) => {
          let otheruserUid = childS2napshot.key;
          console.log(otheruserUid);
          const childData = childS2napshot.val();
          const usersRef = firebase.database().ref("users");
          const userRef = usersRef.child(otheruserUid);
          const userData = [];

          const userData2 = userRef.once("value").then((snapshot) => {
            let firstName = snapshot.val().first_name;
            let imageUrl = snapshot.val().image_url;
            localStorage.OtherUserName = firstName;
            localStorage.OtherUserImage = imageUrl;
            userData.push(firstName, imageUrl);
            return [firstName, imageUrl];
          });

          console.log(userData);
          let first = userData[0];
          let image = userData[1];
          console.log(userData[1]);

          let mainClass = "au-inbox-wrap js-inbox-wrap";
          if (newChat) mainClass = "au-inbox-wrap js-inbox-wrap show-chat-box";

          str += `<div class="${mainClass}">
            <div class="au-message js-list-load">
                <div class="au-message-list">
                    <div class="au-message__item" onclick="changeClass()">
                        <div class="au-message__item-inner">
                            <div class="au-message__item-text">
                                <div class="avatar-wrap">
                                    <div class="avatar">
                                        <img src="${localStorage.getItem(
                                          "OtherUserImage"
                                        )}" alt="${localStorage.getItem(
            "OtherUserName"
          )}">
                                    </div>
                                </div>
                                <div class="text">
                                    <h5 class="name">${localStorage.getItem(
                                      "OtherUserName"
                                    )}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
            <div class="au-chat">
                <div class="au-chat__title">
                    <div class="au-chat-info">
                        <div class="avatar-wrap">
                            <div class="avatar avatar--small">
                                <img src="${localStorage.getItem(
                                  "OtherUserImage"
                                )}" alt="user1">
                            </div>
                        </div>
                        <span class="nick">
                            <a>${localStorage.getItem("OtherUserName")}</a>
                        </span>
                    </div>
                </div>
                <div class="au-chat__content">
                    <div class="send-mess-wrap">
                        <div class="send-mess__inner">
                            <div class="send-mess-list">
                                <div class="send-mess">${childData.m_1}</div>
                            </div>
                        </div>
                    </div>
                    <div class="recei-mess-wrap">
                        <div class="recei-mess__inner">
                            <div class="avatar avatar--tiny">
                                <img src="${localStorage.getItem(
                                  "OtherUserImage"
                                )}" alt="user1">
                            </div>
                            <div class="recei-mess-list">
                                <div class="recei-mess">${childData.h_2}</div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
        });
      }
    });
    str += `<div class="au-chat-textfield">
    <form class="au-form-icon">
        <input class="au-input au-input--full au-input--h65" type="textarea"
            placeholder="Type a message">
        <div class="mess-btn mar-top-20">
            <div class="row">
                <div class="col-md-6 col-sm-12">
                    <a href="messages.html" class="float-left btn v3"><i
                            class="ion-ios-arrow-back"></i> Back</a>
                </div>
                <div class="col-md-6 col-sm-12 order-md-2 order-first">
                    <a class="float-right sm-left btn v8"> Send message<i
                            class="ion-android-send"></i></a>
                </div>
            </div>
        </div>
    </form>
</div>
</div>
</div>`;
    $("#insertMasseges").append(str);
  });
}

/*----------------------------------------------------------------currency ------------------------------------------------------------------------------------------------*/
// function googleSearchApi() {
//   // need to enter this in the html     <script src="https://apis.google.com/js/api.js"></script>

//   const API_KEY = "AIzaSyAHthZ5KFcB6TMxYjDEPW-gAX-cz0fjQh0";
//   const SEARCH_ENGINE_ID = "52fe6f0a4d54046fd";
//   let QUERY = "ערך היורו";
//   QUERY = QUERY.replace(" ", "%20");

//   const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${QUERY}`;

//   fetch(url)
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(url);
//       console.log(data.items);
//     })
//     .catch((error) => console.error(error));
// }
