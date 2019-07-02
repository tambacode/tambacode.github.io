var auth_UserOnline = false;

var auth_RequireLoggingToAccess = function(url) {
    if (auth_UserOnline) {
        window.location.href = url;
    } else {
        window.location.href = 'login.html?redirectUrl=' + url;
    }
};

var auth_RequestLogin = function(provider, providerName) {
    firebase.auth().useDeviceLanguage();
    
    firebase.auth().signInWithPopup(provider)
    .then(function(result) {
        auth_LoginSuccessful(result, providerName);
    }).catch(function(error) {
        auth_LoginFailed(error, providerName);
    });
};

var auth_LoginSuccessful = function(result, providerName) {
    // result.credential.accessToken;
    //auth_successfulLogin(result.user.uid, result.user.displayName)
    var providerToken = null;
    var uid = null

    if (providerName == 'facebook') {
        uid = result.user.uid;
        providerToken = result.credential.accessToken;
    }
    
    var path = '/users/' + uid;

    var onSucess = function(snapshot) {
        auth_LogUser();
    };

    var onNullValue = function(snapshot) {
        db_InsertUserOnLogin(path, result.user.displayName, providerName, providerToken);

        auth_LogUser();
    };

    db_get(path, onSucess, onNullValue, auth_LoginFailed);
};

var auth_LoginFailed = function(error, providerName) {
    $.uiAlert({
        textHead: 'Problema no login',
        text: 'Não foi possível realizar o login no ' + providerName,
        bgcolor: '#DB2828',
        textcolor: '#fff',
        position: 'top-center',
        time: 2
    });
};

var auth_LogUser = function() {
    auth_UserOnline = true;

    redirectUrl = misc_GetUrlParam('redirectUrl');
    if (redirectUrl != '') {
        auth_RequireLoggingToAccess(redirectUrl);
    }
}

///////////////////////////////// PROVIDER DEPENDENT /////////////////////////////////
////// STEPS TO CONFIGURE FACEBOOK LOGIN //////
// - Create a Facebook app
// - Add the app domain into Facebook - Config/Basic
// - Add a web login product into the Facebook App - Products/Login
// - Into Facebook App, add the OAuth Valid URLs. (Facebook Login/Config)
// - Into Firebase, enable Facebook Login
// - Into Firebase, add Facebook App ID
// - Into Firebase, add Facebbok App Secret 
// - Add the app web site into the Facebook app (Config/Basic/Web Site Url)
// - To Place it online, Add the Privacy Police and Use Terms
// - To Place it online, place the App Online
////// STEPS TO CONFIGURE FACEBOOK //////

var auth_LoginFacebook = function() {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.setCustomParameters({
      'display': 'popup'
    });

    auth_RequestLogin(provider, 'facebook');
};
//////////////////////////////////////////////////////////////////////////////////////