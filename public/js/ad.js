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
const ads_SearchAd = function()
{
    const searchVal = $("#adsSearchInput").val();

    if (searchVal.length > 0)
    {
        misc_GoToPage("ad_search.html?searchTerm=" + searchVal);
    }
}

const ads_FavoriteAdClick = function(self)
{
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
        ads_FavoriteAd(uid);
    } else {
        ads_UnfavoriteAd(uid);
    }
}

const ads_FavoriteAd = function(uid)
{
    console.log(uid);
    console.log("ads_FavoriteAd method needs to be implemented");
}

const ads_UnfavoriteAd = function(uid)
{
    console.log(uid);
    console.log("ads_UnfavoriteAd method needs to be implemented");   
}
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