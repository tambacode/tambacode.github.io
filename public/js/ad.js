/* This file is dedicate to store all logic part about ad_registration interface */

///////////////////////////////// AD REG /////////////////////////////////
const db_InsertAdRegistration = function() {
    // Test if there is any image being uploaded
    if (ad_UploadingImage > 0) {
        misc_DisplayErrorMessage('Imagem carregando', 'Favor aguardar todas as imagens finalizarem o upload');
        return
    }

    var key =  db_GetNewPushKey('ad');
    var path = 'ad/' + key;
    let tel_visible_info = 0;

    //Form fields
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;

    if (products.checked == true) {
        var category = "produtos";
    } else if(services.checked == true) {
        var category = "servicos";
    }
    const subcategory = document.getElementById('subcategory').innerText;

    var price = document.getElementById('price').value;
    var location = document.getElementById('location').value;
    var cep = document.getElementById('cep').value;
	var tel = document.getElementById('tel').value;
    var tel_visible = document.getElementById('tel_visible');

    if(tel_visible.checked == true){
        tel_visible_info = 1;
    }
    else{
        tel_visible_info = 0;
    }
    
    var dataToInsert = {
        user: localStorage.getItem('auth_UserUID'),
        title: title,
        description: description,
        category: category,
        subcategory: subcategory,
        price: price,      
        location: location,
        cep: cep,
        tel: tel,
        tel_visible: tel_visible_info,
        images: "",
        timestamp: Date.now()             
    };

    ad_Register_SaveImagePathToDB(key, ad_CurrentlyAddedImages);
    db_set(path, dataToInsert);
    db_InsertAdRegistrationOnUsers(key);
    auth_RequireLoggingToAccess('ad_detail.html?uid=' + key);
};

const ad_Register_SaveImagePathToDB = function(adUID, imagesArray) {
    var path = 'ads_images/' + adUID;
    var adImagesRef = db.ref(path);

    for (var i = 0; i < imagesArray.length; i++) {
        const imageKey = db_GetNewPushKey(path)
        adImagesRef.child(imageKey).set(imagesArray[i]);
    }
};

var db_InsertAdRegistrationOnUsers = function(key){
    var path = 'users/' + localStorage.getItem('auth_UserUID') + '/ad/' + key;
    db_set(path, key);
};

const ad_GetCategory = function() {
    const products = document.getElementById('products');
    const services = document.getElementById('services');

    if (products.checked == true) {
                $('#subcategory')
                  .dropdown({
                    values: [
                      {
                        name: 'Cereais',
                        value: 'Cereais',
                        selected: true
                      },
                      {
                        name     : 'Organicos',
                        value    : 'Organicos'                        
                      },
                      {
                        name     : 'Proteina',
                        value    : 'Proteina'                        
                      },
                      {
                        name     : 'Vegetais',
                        value    : 'Vegetais'                        
                      },
                      {
                        name     : 'Frutas',
                        value    : 'Frutas'                        
                      },
                      {
                        name     : 'Laticinios',
                        value    : 'Laticinios'                        
                      },
                      {
                        name     : 'Flores e Plantas',
                        value    : 'Flores e Plantas'                        
                      }
                    ]
                  })
                ;
    } else if(services.checked == true) {
            $('#subcategory')
                  .dropdown({
                    values: [
                      {
                        name: 'Tratorista',
                        value: 'Tratorista',
                        selected : true
                      },
                      {
                        name     : 'Agricultor',
                        value    : 'Agricultor'                        
                      },
                      {
                        name     : 'Manutencao de Maquinario',
                        value    : 'Manutencao de Maquinario'                        
                      },
                      {
                        name     : 'Medico Veterinario',
                        value    : 'Medico Veterinario'                        
                      },
                      {
                        name     : 'Caseiro',
                        value    : 'Caseiro'                        
                      }
                    ]
                  })
                ;
    }
}
///////////////////////////////// AD REG /////////////////////////////////
// Informs how many imagens user has added
var ad_QtdRegisterImages = 0;
// Informs the uploaded images URLS 
var ad_CurrentlyAddedImages = [];
// Informs how many images are currently being uploaded
var ad_UploadingImage = 0;

const ad_RegisterUploadImage = function(fileInput) {
    ad_UploadingImage += 1;

    ad_Register_RemovePlusIcon(fileInput);
    ad_Register_SetImageLoading(fileInput);

    //Limit images quantity to 5
    if (ad_QtdRegisterImages < 5) {
        ad_Register_AddNewImage();
    }
    
    // Create a storage ref
    const adsImagePath = "ads_images/";
    const imgName = db_GetNewPushKey(adsImagePath);
    //var storageRef = firebase.storage().ref('ads_images/' + fileInput.files[0].name);
    var storageRef = firebase.storage().ref(adsImagePath + imgName);

    // Upload file
    var task = storageRef.put(fileInput.files[0]);

    // Update progress bar
    task.on('state_changed',
        function progress(snapshot) {
            //const perc = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        function error(err) {
            ad_UploadingImage -= 1;
            misc_DisplayErrorMessage('Upload imagem', 'Erro ao subir a imagem, tente novamente');
        },
        function complete() {
            ad_UploadingImage -= 1;
            // Upload completed successfully, now we can get the download URL
            task.snapshot.ref.getDownloadURL().then(function(imageURL) {
                ad_CurrentlyAddedImages.push(imageURL);
                
                $(fileInput).parent().find('img').attr('src', imageURL);

                ad_Register_RemoveLoadingIconFromImage(fileInput);
            });
        }
    );
};

const ad_Register_RemoveLoadingIconFromImage = function(target) {
    $(target).parent().find('div').remove();
};

const ad_Register_RemovePlusIcon = function(target) {
    $(target).parent().find('div').remove();
};

const ad_Register_SetImageLoading = function(target) {
    var loading = '<div class="ui active inverted dimmer"><div class="ui text loader">Carregando</div></div>';

    $(target).parent().append(loading);
};

const ad_Register_AddNewImage = function() {
    var imageCard = '<div class="five wide column row" id="{0}"><div class="ui active inverted dimmer"><i onclick="$(this).parent().parent().find(\'input\').click();" class="plus big click icon"></i></div><img src="imgs/black.png" class="ui tiny image"><input id="{1}" type="file" value="upload" style="display: none;"></div>';

    const columnId = 'ImageColumn' + ad_QtdRegisterImages;
    const inputId = 'ImageInput' + ad_QtdRegisterImages;

    imageCard = imageCard.replace('{0}', columnId);
    imageCard = imageCard.replace('{1}', inputId);

    $("#ImagesGrid").append(imageCard);

    $('#' + inputId).on('change', function(e) {
        ad_RegisterUploadImage(e.target);
    });

    ad_QtdRegisterImages = ad_QtdRegisterImages + 1;
};

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
    misc_DisplayErrorMessage('Erro ao exibir an�ncio', 'Favor tentar mais tarde');
};

/////////////////////////////////  AD DETAIL /////////////////////////////////