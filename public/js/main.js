window.fb = {};

fb.firebaseConfig = {
    apiKey: "AIzaSyD1aOg-QStOG5VB-imai9JF68h9Qq2q8So",
    authDomain: "shared-farm-dev.firebaseapp.com",
    databaseURL: "https://shared-farm-dev.firebaseio.com",
    projectId: "shared-farm-dev",
    storageBucket: "shared-farm-dev.appspot.com",
    messagingSenderId: "619465723035",
    appId: "1:619465723035:web:4dac067dc0eb3abf"
  };

firebase.initializeApp(fb.firebaseConfig);

////////////////// USER //////////////////
const user_OpenProfile = function() {
	auth_RequireLoggingToAccess('user_info.html');
};
////////////////// USER //////////////////

const misc_GoToHome = function() {
    auth_RequireLoggingToAccess('index.html');
};

const misc_GetUrlParam = function(param) {
	var url = new URL(window.location.href);
	return url.searchParams.get(param);
};

const misc_GoToPage = function(url, forceChange) {
    if (window.location.pathname.replace('/', '') != url || forceChange) {
        window.location.href = url; 
    }
};

const misc_LowerCase = function(string) {
    return string.toLowerCase();
};

const misc_RemoveLoader = function() {
    var loader = $('#loader');

    if (loader != null) {
        loader.remove();
        return true;
    }

    return false;
};

const misc_waitImageLoadReady = function(image, url, callback){
    
    $(image)
        .attr('src', url)
        .one("load", callback)
        .each(function() {
            if(this.complete) {
                $(this).load();
            }
        });
};

const misc_GetImageRotation = function(image) {
    var el = $(image),
        tr = el.css("-webkit-transform") || el.css("-moz-transform") || el.css("-ms-transform") || el.css("-o-transform") || '',
        info = {rad: 0, deg: 0};
    if (tr = tr.match('matrix\\((.*)\\)')) {
        tr = tr[1].split(',');
        if(typeof tr[0] != 'undefined' && typeof tr[1] != 'undefined') {
            info.rad = Math.atan2(tr[1], tr[0]);
            info.deg = parseFloat((info.rad * 180 / Math.PI).toFixed(1));
        }
    }
    return info;
};

const misc_SetImageRotation = function(image, angleValue){
  
  $(image).css({
        "-webkit-transform": "rotate(" + angleValue + "deg)",
        "-moz-transform": "rotate(" + angleValue + "deg)",
        "transform": "rotate(" + angleValue + "deg)" /* For modern browsers(CSS3)  */
    });
};

const misc_RemoveErrorNullMsg = function() {
    var errorMSG = $('#errorMsg');

    if (errorMSG) {
        errorMSG.remove();
    }

    var nullValueMSG = $('#nullValueMsg');

    if (nullValueMSG) {
        nullValueMSG.remove();
    }
};

const misc_GetErrorMsg = function(withRow) {
    return misc_GetNullValueOrder(withRow, 'errorMsg', 'Erro ao executar a pesquisa');
};

const misc_GetNullValueMsg = function(withRow) {
    return misc_GetNullValueOrder(withRow, 'nullValueMsg', 'Nenhum valor encontrado');
};

const misc_GetNullValueOrder = function(withRow, id, message) {
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
};

//// FLOAT NUMBER ////
const misc_ReplaceAll = function(str, find, replace) {
    return str.replace(new RegExp(misc_EscapeRegExp(find), 'g'), replace);
};

const misc_EscapeRegExp = function(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

const misc_GetFloatNumber = function(numberAsString) {
    var value = misc_ReplaceAll(numberAsString, '.', '');
    value = value.replace(',', '.');

    return parseFloat(value);
};
//// FLOAT NUMBER ////

const misc_GetHourMin = function(timestamp) {
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
};

const misc_GetDate = function(date, includeDate, includeTime) {
    var msg = '';

    if (includeDate) {
        msg += date.getUTCDate() + ' DE ' + misc_GetDescriptiveMonth(date.getUTCMonth()) + ' DE ' + date.getUTCFullYear();
    } else if (includeTime) {
        msg += ' ' + misc_GetHourMin(timestamp);
    }

    return msg;

    return '';
};

const misc_GetDescriptiveMonth = function(month) {
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
};

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

const misc_DisplaySuccessMessage = function(title, text) {
    $.uiAlert({
        textHead: title,
        text: text,
        bgcolor: '#8FE15F',
        textcolor: '#fff',
        position: 'top-center',
        time: 2
    });
};

const misc_GetPrice = function(value) {
    var val = "R$" + value;
    return val;
};

const misc_GetStringWithMaxCharacthers = function(string, maxChars) {
    if (string.length <= maxChars) {
        return string;
    }

    return string.substring(0, maxChars) + "...";
};

/*
Usage of States & City functions
1. On loading of page, init your State Dropdown with function misc_InitDropdownWithStates(statedropdown, citydropdown)
2. When changing state dropdown a onChange function will be triggered to fill citydropdown
3. In case of programatically change state dropdown value
3.1 set waitTimeout (function(), delay) to wait 2secs in order to all cities to be loaded in city dropdown
3.2 set in function callback value of city dropdown
*/
const misc_ListWithStates = [
    {"id":12,"sigla":"AC","nome":"Acre"},
    {"id":27,"sigla":"AL","nome":"Alagoas"},
    {"id":13,"sigla":"AM","nome":"Amazonas"},
    {"id":16,"sigla":"AP","nome":"Amapá"},
    {"id":29,"sigla":"BA","nome":"Bahia"},
    {"id":23,"sigla":"CE","nome":"Ceará"},
    {"id":53,"sigla":"DF","nome":"Distrito Federal"},
    {"id":32,"sigla":"ES","nome":"Espírito Santo"},
    {"id":52,"sigla":"GO","nome":"Goiás"},
    {"id":21,"sigla":"MA","nome":"Maranhão"},
    {"id":50,"sigla":"MS","nome":"Mato Grosso do Sul"},
    {"id":51,"sigla":"MT","nome":"Mato Grosso"},
    {"id":31,"sigla":"MG","nome":"Minas Gerais"},
    {"id":15,"sigla":"PA","nome":"Pará"},
    {"id":25,"sigla":"PB","nome":"Paraíba"},
    {"id":41,"sigla":"PR","nome":"Paraná"},
    {"id":26,"sigla":"PE","nome":"Pernambuco"},
    {"id":22,"sigla":"PI","nome":"Piauí"},
    {"id":11,"sigla":"RO","nome":"Rondônia"},
    {"id":33,"sigla":"RJ","nome":"Rio de Janeiro"},
    {"id":24,"sigla":"RN","nome":"Rio Grande do Norte"},
    {"id":43,"sigla":"RS","nome":"Rio Grande do Sul"},
    {"id":14,"sigla":"RR","nome":"Roraima"},
    {"id":42,"sigla":"SC","nome":"Santa Catarina"},
    {"id":35,"sigla":"SP","nome":"São Paulo"},
    {"id":28,"sigla":"SE","nome":"Sergipe"},
    {"id":17,"sigla":"TO","nome":"Tocantins"}
];

const misc_GetStateIdFromSigla = function(uf){
    var stateId = "";
    $.each(misc_ListWithStates, function(id, state){
        (state.sigla === uf) ? (stateId = state.id) : "";
    });
    return stateId;
};

const misc_InitDropdownWithStates = function(dropdownState, dropdownCity, adAnyState, onCityDropdownFillCallback){
    var values = [];
    
    //values.push({ name: 'Selecione', value: '', selected : true });
    if (adAnyState) {
        values.push({ name: 'Selecione', value: ''});
    }

    $.each(misc_ListWithStates, function (id, state) {
        values.push({ name: state.nome, value: state.sigla});
    });
    
    dropdownState.dropdown({ values: values });
    dropdownState.dropdown({
        onChange: function (value, text, $selectedItem) {
            dropdownCity.addClass('loading disabled');
            misc_InitDropdownCityFromStateSelection(value, dropdownCity, onCityDropdownFillCallback).then(function(){
                dropdownCity.removeClass('loading disabled');
            });
        }
    });
};

const misc_InitDropdownCityFromStateSelection = async function (sigla, dropdownCity, onCityDropdownFillCallback){
    var values = [];
    var stateId = misc_GetStateIdFromSigla(sigla);
    const urlCityIbge = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/' + stateId + '/municipios';

    values.push({ name: 'Selecione', value: '', selected : true });

    var listWithCities = await $.getJSON(urlCityIbge);
    $.each(listWithCities, function (id, city) {
        values.push({ name: city.nome, value: city.nome});
    });
    
    dropdownCity.dropdown({ values: values });

    if (onCityDropdownFillCallback) {
        onCityDropdownFillCallback();
    }
};