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
	auth_RequireLoggingToAccess('ad_user.html');
};
////////////////// USER //////////////////

misc_GetUrlParam = function(param) {
	var url = new URL(window.location.href);
	return url.searchParams.get(param);
};

misc_GoToPage = function(url) {
	window.location.href = url;	
}

misc_RemoveLoader = function() {
    $('#loader').remove();
}

misc_RemoveErrorNullMsg = function() {
    var errorMSG = $('#errorMsg');

    if (errorMSG) {
        errorMSG.remove();
    }

    var nullValueMSG = $('#nullValueMsg');

    if (nullValueMSG) {
        nullValueMSG.remove();
    }
}

misc_GetErrorMsg = function(withRow) {
    return misc_GetNullValueOrder(withRow, 'errorMsg', 'Erro ao executar a pesquisa');
}

misc_GetNullValueMsg = function(withRow) {
    return misc_GetNullValueOrder(withRow, 'nullValueMsg', 'Nenhum valor encontrado');
}

misc_GetNullValueOrder = function(withRow, id, message) {
    var str = '';

    if (withRow) {
        str += '<div id="' + id + '" class="row"><div class="sixteen wide column">';
        str += '<div class="ui segment"><h4 class="ui center aligned header">' + message + '</h4></div>'
    } else {
        str += '<div id="' + id + '" class="ui segment"><h4 class="ui center aligned header">' + message + '</h4></div>'
    }

    if (withRow) {
        str += '</div></div>';
    }

    return str;
}

misc_GetHourMin = function(timestamp) {
    const date = new Date(parseInt(timestamp));

    var h = date.getHours();
    var m = date.getMinutes();

    if (h <= 9) {
        h = "0" + h;
    }

    if (m <= 9) {
        m = "0" + m;
    }

    return h + ":" + m;
}

misc_GetDate = function(date, includeDate, includeTime) {
    var msg = '';

    if (includeDate) {
        msg += date.getUTCDate() + ' DE ' + misc_GetDescriptiveMonth(date.getUTCMonth()) + ' DE ' + date.getUTCFullYear();
    } else if (includeTime) {
        msg += ' ' + misc_GetHourMin(timestamp);
    }

    return msg;

    return '';
}

misc_GetDescriptiveMonth = function(month) {
    switch(month) {
        case 0:
            return 'Janeiro'
        case 1:
            return 'Fevereiro'
        case 2:
            return 'Março'
        case 3:
            return 'Abril'
        case 4:
            return 'Maio'
        case 5:
            return 'Junho'
        case 6:
            return 'Julho'
        case 7:
            return 'Agosto'
        case 8:
            return 'Setembro'
        case 9:
            return 'Outubro'
        case 10:
            return 'Novembro'
        case 11:
            return 'Dezembro'
    }
}

const misc_DisplayErrorMessage = function(title, text) {
    $.uiAlert({
        textHead: title,
        text: text,
        bgcolor: '#DB2828',
        textcolor: '#fff',
        position: 'top-center',
        time: 2
    });
};