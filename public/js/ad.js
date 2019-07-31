/* This file is dedicate to store all logic part about ad_registration interface */


///////////////////////////////// AD REG /////////////////////////////////
var db_InsertAdRegistration = function() {
    var key =  db_GetNewPushKey('ad');
    var path = 'ad/' + key;
    
    //Form fields
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;

    if(products.checked == true){
        var category = "produtos";
    }else{
        var category = "serviços";
    }

    var price = document.getElementById('price').value;
    var location = document.getElementById('location').value;
    var cep = document.getElementById('cep').value;
	var tel = document.getElementById('tel').value;
    
    var dataToInsert = {
        user: localStorage.getItem('auth_UserUID'),
        title: title,
        description: description,
        category: category,
        price: price,      
        location: location,
        cep: cep,
        tel: tel              
    };

    db_set(path,dataToInsert);
    db_InsertAdRegistrationOnUsers(key);
    auth_RequireLoggingToAccess('ad_detail.html?uid=' + key);
};

var db_InsertAdRegistrationOnUsers = function(key){
    var path = 'users/' + localStorage.getItem('auth_UserUID') + '/ad/' + key;
    db_set(path, key);
};
///////////////////////////////// AD REG /////////////////////////////////

const pleaseNameME = function() {
    //AD Images
    //This function add imagens on data base
    const fileButton = document.getElementById('fileButton');
    const uploader = document.getElementById('uploader');
    const uploadMsg = document.getElementById('uploadMsg');

    fileButton.addEventListener('change', function(e) {

        var fileButton = document.getElementById('fileButton');

        // Create a storage ref
        var storageRef = firebase.storage().ref('images/' + fileButton.files[0].name);

        // Upload file
        var task = storageRef.put(fileButton.files[0]);

        SetUploadMsg(uploadMsg, 'Uploading');

        // Update progress bar
        task.on('state_changed',
            function progress(snapshot) {
                var perc = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                uploader.value = perc;
            },
            function error(err) {
                SetUploadMsg(uploadMsg, 'Image Upload Error');
            },
            function complete() {
                SetUploadMsg(uploadMsg, 'Image Uploaded');
            }
        );
    });
}

//Visual feedback for user
SetUploadMsg = function(p, msg) {
    p.innerHTML = msg;

    if (msg == '')
    {
        p.classList.add('hide');
    } else {
        p.classList.remove('hide');
    }
}

///////////////////////////////// ADS SEARCH /////////////////////////////////
var lastAdUIDReceived = null;
const ads_SearchAd = function() {
    const searchVal = $("#adsSearchInput").val();

    if (searchVal.length > 0)
    {
        misc_GoToPage("ad_search.html?searchTerm=" + searchVal);
    }
};

const ad_GetAdCard = function(uid, image, title, price, description, showFavoriteButton, favoriteSelected) {
    const addImage = '<div class="four wide column product_image"><a href="ad_detail.html?uid={0}"><img src="{1}" class="ui tiny rounded image"></a></div>';
    const addInfo  = '<div class="twelve wide column product_info"><a href="ad_detail.html?uid={2}"><h4 id="title">{3}</h4></a><i onclick="ads_List_FavoriteAdClick(this);" uid="{4}" class="red large link {5} {6} icon favoriteItem"></i><h3 id="price">{7}</h3><span id="info">{8}</span><div style="width: 100%;" class="ui divider"></div></div>';

    var card = addImage + addInfo;
    card = card.replace('{0}', uid);
    card = card.replace('{1}', image);
    card = card.replace('{2}', uid);
    card = card.replace('{3}', title);
    card = card.replace('{4}', uid);
    card = card.replace('{5}', (showFavoriteButton) ? "heart" : "");
    card = card.replace('{6}', (favoriteSelected) ? "" : "outline");
    card = card.replace('{7}', misc_GetPrice(price));
    card = card.replace('{8}', misc_GetStringWithMaxCharacthers(description, 40));

    return card;
    //ad __ id, category, cep, description, location, price, tel, title, user
};

const ad_List_AddCardToList = function(holder, card) {
    holder.append(card);
};

const ads_List_ListAdsByTerm = function(term) {
    const firstCall = (lastAdUIDReceived == null);

    var onSucess = function(snapshot) {
        misc_RemoveLoader();
        
        const holder = $("#ads");
        $.each(snapshot.val(), function(uid, obj) {
            lastAdUIDReceived = uid;

            //TODO: SET CORRECT IMAGE
            ad_List_AddCardToList(holder, ad_GetAdCard(uid, "imgs/black.png", obj.title, obj.price, obj.description, true, false));
        });
    };

    const onError = function(snapshot) {
        if (misc_RemoveLoader()) {
            $("#ads").append(misc_GetErrorMsg(true));
        }
    };

    if (firstCall) {
        //TODO: Change "title" to "timestamp", when this field is added to database, so we can order the ads list by their creation date.
        db_getOrderByChildContainsLimitToLast("ad", "title", term, 10, onSucess, onError, onError);
    } else {
        console.log("SE");
    }
};

const ads_List_FavoriteAdClick = function(self) {
    const item = $(self);
    var favoriteAdd = false;
    const uid = $(self).attr("uid");
    
    if ($(self).hasClass('outline'))
    {
        item.removeClass('outline');
        favoriteAdd = true;
    } else {
        item.addClass('outline');
    }

    if (favoriteAdd) {
        ads_List_FavoriteAd(uid);
    } else {
        ads_List_UnfavoriteAd(uid);
    }
};

const ads_List_FavoriteAd = function(uid) {
    console.log(uid);
    console.log("ads_List_FavoriteAd method needs to be implemented");
};

const ads_List_UnfavoriteAd = function(uid) {
    console.log(uid);
    console.log("ads_List_UnfavoriteAd method needs to be implemented");   
};
///////////////////////////////// ADS SEARCH /////////////////////////////////
/////////////////////////////////  AD DETAIL /////////////////////////////////
const ad_GetAllValues = function(){
    const adUID = misc_GetUrlParam('uid');
    var adPath = 'ad/' + adUID;
    var title = document.getElementById(title);
    var location = document.getElementById(location);
    var description = document.getElementById(description);
    var category = document.getElementById(category);
    var price = document.getElementById(price);
    var name = document.getElementById(name);

    var onSucess = function(snapshot) {
        console.log("onSucess from db_get()");
        var val = snapshot.val();
        console.log("val");
        console.log(val);
        ad_ValuesIntoDetail(val);
    };

    db_get(adPath, onSucess, ad_ErrorFunction, ad_ErrorFunction);
/*
category: "produtos"
cep: "12312-312"
description: "123123"
location: "1231231231"
price: "1.231,23"
tel: "(12) 31231-2312"
title: "123123"
user: "ATZNxS0zbdZRX8Apy7JiHZmujaG2"
*/
}

const ad_ValuesIntoDetail = function(val) {
    category.innerText = val.category;
    description.innerText = val.description;
    location.innerText = val.location;
    price.innerText = val.price;
    title.innerText = val.title;
    name.innerText = val.user;
};

const ad_ErrorFunction = function(error) {
    console.log(error);
    misc_DisplayErrorMessage('Erro ao exibir anúncio', 'Favor tentar mais tarde');
};

/////////////////////////////////  AD DETAIL /////////////////////////////////