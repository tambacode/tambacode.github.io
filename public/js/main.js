window.fb = {};

fb.firebaseConfig = {
    apiKey: "AIzaSyD1aOg-QStOG5VB-imai9JF68h9Qq2q8So",
    authDomain: "shared-farm-dev.firebaseapp.com",
    databaseURL: "https://shared-farm-dev.firebaseio.com",
    projectId: "shared-farm-dev",
    storageBucket: "",
    messagingSenderId: "619465723035",
    appId: "1:619465723035:web:4dac067dc0eb3abf"
  };

firebase.initializeApp(fb.firebaseConfig);

////////////////// USER //////////////////
user_OpenProfile = function() {
	auth_RequireLoggingToAccess('profile');
};
////////////////// USER //////////////////

misc_GetUrlParam = function(param) {
	var url = new URL(window.location.href);
	return url.searchParams.get(param);
};

misc_GoToPage = function(url) {
	window.location.href = url;	
}

misc_GetErrorMsg = function(withRow) {
    return misc_GetNullValueOrder(withRow, 'Erro ao executar a pesquisa');
}

misc_GetNullValueMsg = function(withRow) {
    return misc_GetNullValueOrder(withRow, 'Nenhum valor encontrado');
}

misc_GetNullValueOrder = function(withRow, message) {
    var str = '';

    if (withRow) {
        str += '<div class="row"><div class="sixteen wide column">';
    }

    str += '<div class="ui segment"><h4 class="ui center aligned header">' + message + '</h4></div>'

    if (withRow) {
        str += '</div></div>';
    }

    return str;
}