window.preventAuthInit = false;

var auth_Init = function() {
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (window.preventAuthInit == false) {
            if (firebaseUser) {
                auth_LogOnUser(firebaseUser);
            } else {
                auth_UserLoggedOut();
            }
        }
    });
}

var auth_RequireLoggingToAccess = function(url) {
    if (localStorage.getItem('auth_UserOnline')) {
        misc_GoToPage(url);
    } else {
        misc_GoToPage('login.html?redirectUrl=' + url);
    }
};

var auth_RequireLoggingToAccessFunction = function(action, url) {
    const adUID = misc_GetUrlParam('uid');

    if (localStorage.getItem('auth_UserOnline')) {
        action();
    } else if(url == 'ad_detail.html'){
        misc_GoToPage('login.html?redirectUrl=' + url + '?uid=' + adUID);
    }else {
        misc_GoToPage('login.html?redirectUrl=' + url);
    }
};

var auth_RequestLogin = function(provider, providerName) {
    window.preventAuthInit = true;
    firebase.auth().useDeviceLanguage();
    
    firebase.auth().signInWithPopup(provider)
    .then(function(result) {
        auth_LoginSuccessful(result, providerName);
    }).catch(function(error) {
        auth_LoginFailed(error, providerName);
    });
};

var auth_LoginSuccessful = function(result, providerName) {
    // Some params from facebook
    //result.user.uid | result.user.displayName | result.credential.accessToken | result.user.photoURL

    var providerToken = null;
    var uid = null

    if (providerName == 'facebook') {
        uid = result.user.uid;
        providerToken = result.credential.accessToken;
    } else if (providerName == 'twitter') {
        uid = result.user.uid;
        providerToken = result.credential.accessToken;
    } else if (providerName == 'google') {
        uid = result.user.uid;
        providerToken = result.credential.accessToken;
    }
    
    var path = '/users/' + uid;

    var onSucess = function(snapshot) {
        auth_LogOnUser(snapshot);
    };

    var onNullValue = function(snapshot) {
        db_InsertUserOnLogin(path, result.user.displayName, result.user.email, providerName, providerToken);

        auth_LogOnUser(snapshot);
    };

    db_get(path, onSucess, onNullValue, auth_LoginFailed);
};

var auth_LoginFailed = function(error, providerName) {
    const text = 'Não foi possível realizar o login no ' + providerName;
    misc_DisplayErrorMessage('Problema no login', text);
};

var auth_LogOnUser = function(firebaseUser) {
    window.preventAuthInit = false;
    
    localStorage.setItem('auth_UserOnline', true);
    localStorage.setItem('auth_UserUID', firebaseUser.uid);
    
    redirectUrl = misc_GetUrlParam('redirectUrl');
    if (redirectUrl) {
        auth_RequireLoggingToAccess(redirectUrl);
    } else {
        $('#LogoutButton').removeClass("hidden");
        $('#PerfilButton').removeClass("hidden");
    }
}

const auth_LogoffUser = function() {
    firebase.auth().signOut();
};

const auth_UserLoggedOut = function() {
    if (localStorage.getItem('auth_UserOnline') != null) {
        localStorage.removeItem('auth_UserOnline');
        localStorage.removeItem('auth_UserUID');

        misc_GoToPage('index.html', true);
    } else {
        $('#LoginButton').removeClass("hidden");
    }
};

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

var auth_LoginGoogle = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      'display': 'popup'
    });

    auth_RequestLogin(provider, 'google');
};

var auth_LoginTwitter = function() {
    var provider = new firebase.auth.TwitterAuthProvider();
    provider.setCustomParameters({
      'display': 'popup'
    });

    auth_RequestLogin(provider, 'twitter');
};
//////////////////////////////////////////////////////////////////////////////////////

if (navigator.onLine) {
    auth_Init();
}