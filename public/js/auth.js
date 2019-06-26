var auth_facebookLogin = function() {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.setCustomParameters({
      'display': 'popup'
    });

    firebase.auth().useDeviceLanguage();
    
    firebase.auth().signInWithPopup(provider)
    .then(function(result) {
        //console.log("Login Success");
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        window.loginToken = result.credential.accessToken;
        // The signed-in user info.
        window.user = result.user;

        // Insert User Data
        insertData(window.user.uid, window.user.displayName, window.notificationKey);
    }).catch(function(error) {
        //console.log("Login Failed");
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
    });
}