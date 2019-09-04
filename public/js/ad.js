/* This file is dedicate to store all logic part about ad_registration interface */

const ad_initComponent = function(){
    $('form.ad_register')
        .form({
        onSuccess: function(event){
            event.preventDefault();
        }
    });
}

const ad_showFields = function(){
    misc_RemoveLoader();
    $(".ui.container").show();
}


///////////////////////////////// AD REG /////////////////////////////////
const ad_checkPopupType = function(){
    const edit = misc_GetUrlParam('isitforEdit');
    if (!edit){
        $('.ui.modal')
            .modal('setting', 'closable', false)
            .modal('show');
        $(function(){
            $('[type="date"]').prop('min', function(){
                return new Date().toJSON().split('T')[0];
            });
        });
    }
}


const ad_selectedType = function(id){
    $('#' + id)
        .prop('checked', 'true')
        .prop('disabled', false);
    if (id === 'events') { 
        $('.field.events').removeClass('hidden');
    }
    ad_GetCategory();
    $('.ui.modal').modal('hide');
}


const db_InsertAdRegistration = function(flagUpdate, adUID) {
    // Test if there is any image being uploaded

    if (ad_UploadingImage > 0) {
        misc_DisplayErrorMessage('Imagem carregando', 'Favor aguardar todas as imagens finalizarem o upload');
        return;
    }

    if (ad_CurrentlyAddedImages.length == 0) {
        misc_DisplayErrorMessage('Nenhuma imagem', 'Favor adicionar ao menos uma imagem para efetuar o cadastro do anÃºncio.');
        return;
    }

    if(!flagUpdate){
        var key =  db_GetNewPushKey('ad');
    }else if(flagUpdate == 'yes'){
        var key = adUID;
    }
    
    var path = 'ad/' + key;
    let tel_visible_info = 0;

    //Form fields
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;

    if (products.checked == true) {
        var category = "produtos";
    } else if(services.checked == true) {
        var category = "servicos";
    } else {
        var category = "eventos";
    }
    const subcategory = document.getElementById('subcategory').innerText;

    var price = document.getElementById('price').value;
    var location = document.getElementById('locationad').value;
    var cep = document.getElementById('cep').value;
	var tel = document.getElementById('tel').value;
    var state = document.getElementById('statead').innerText;
    var city = document.getElementById('cityad').innerText;
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
        state: state,
        city: city,
        images: "",
        timestamp: Date.now()             
    };

    if (category === "eventos") {
        var event_date = document.getElementById('datead').value;
        var event_site = document.getElementById('sitead').value;
        var event_url = document.getElementById('urlad').value;

        dataToInsert.event_date = event_date;
        dataToInsert.event_site = event_site;
        dataToInsert.event_url = event_url;
    }

    if(!flagUpdate){
        ad_Register_SaveImagePathToDB(key, ad_CurrentlyAddedImages);
        db_set(path, dataToInsert);
        db_InsertAdRegistrationOnUsers(key);
        auth_RequireLoggingToAccess('ad_detail.html?uid=' + key);
    }else if(flagUpdate == 'yes'){
        db_update(path,dataToInsert,misc_GoToPage('ad_detail.html?uid=' + key));
    }
    
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

const ad_InitDropDownWithServices = function(dropDownField, adAny) {
    var values = [];

    if (adAny) {
        values.push({ name: 'Selecione', value: '', selected : true });
        values.push({ name: 'Tratorista', value: 'Tratorista'});
    } else {
        values.push({ name: 'Tratorista', value: 'Tratorista', selected : true });
    }

    values.push({ name : 'Agricultor', value : 'Agricultor' });
    values.push({ name : 'ManutenÃ§Ã£o de MaquinÃ¡rio', value : 'ManutenÃ§Ã£o de MaquinÃ¡rio' });
    values.push({ name : 'MÃ©dico VeterinÃ¡rio', value : 'MÃ©dico VeterinÃ¡rio' });
    values.push({ name : 'Caseiro', value : 'Caseiro' });

    dropDownField.dropdown({ values: values });
};

const ad_InitDropDownWithProducts = function(dropDownField, adAny) {
    var values = [];

    if (adAny) {
        values.push({ name: 'Selecione', value: '', selected : true });
        values.push({ name: 'Cereais', value: 'Cereais'});
    } else {
        values.push({ name: 'Cereais', value: 'Cereais', selected: true });
    }

    values.push({ name : 'OrgÃ¢nicos', value : 'OrgÃ¢nicos' });
    values.push({ name : 'ProteÃ­na', value : 'ProteÃ­na' });
    values.push({ name : 'Vegetais', value : 'Vegetais' });
    values.push({ name : 'Frutas', value : 'Frutas' });
    values.push({ name : 'LaticÃ­nios', value : 'LaticÃ­nios' });
    values.push({ name : 'Flores e Plantas', value : 'Flores e Plantas' });
    
    dropDownField.dropdown({ values: values });
};

const ad_InitDropDownWithEvents = function(dropDownField, adAny) {
    var values = [];

    if (adAny) {
        values.push({ name: 'Selecione', value: '', selected : true });
        values.push({ name: 'Colaborativo', value: 'Colaborativo'});
    } else {
        values.push({ name: 'Colaborativo', value: 'Colaborativo', selected: true });
    }

    values.push({ name : 'NÃ£o-colaborativo', value : 'NÃ£o-colaborativo' });
    
    dropDownField.dropdown({ values: values });
};

const ad_GetCategory = function() {
    const products = document.getElementById('products');
    const services = document.getElementById('services');
    const events = document.getElementById('events');

    if (products.checked === true) {
        ad_InitDropDownWithProducts($('#subcategory'));
    } else if(services.checked === true) {
        ad_InitDropDownWithServices($('#subcategory'));                  
    } else {
        ad_InitDropDownWithEvents($('#subcategory'));
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
    var loading = '<div class="ui active inverted dimmer" id="divloader"><div class="ui text loader">Carregando</div></div>';

    $(target).parent().append(loading);
};

const ad_Register_AddNewImage = function() {
    var imageCard = '<div class="five wide column row" id="{0}"><div class="ui active inverted dimmer"><i onclick="$(this).parent().parent().find(\'input\').click();" class="plus big click icon"></i></div><img src="imgs/black.png" class="ui tiny image list"><input id="{1}" type="file" value="upload" style="display: none;"></div>';

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

///////////////////////////////// ADS UPDATE /////////////////////////////////
const ad_RedirectForEditAd = function(){
    //Get Uid of Ad
    const adUID = misc_GetUrlParam('uid');
    //Redirect user to edit page
    misc_GoToPage("ad_registration.html?isitforEdit=1&uid=" + adUID);
}

//Fill all filds
const ad_fillfieldforEdit = function(){
    const adUID = misc_GetUrlParam('uid');

    //Get all fields
    if (adUID){
        //ad_Register_SetImageLoading('#all');

        $('#ad_add').addClass('hidden');
        $('#ad_edit').removeClass('hidden');
        ad_FillDetailPage(adUID);
        //Get images
        var adPath = 'ads_images/' + adUID;
        var onSucess = function(snapshot) {
            //var val = snapshot.val();

            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                item.key = childSnapshot.key;

                ad_CurrentlyAddedImages.push(item);

                var imageCard = '<div class="five wide column row" id="{0}"><div class="ui active inverted dimmer"><i onclick="$(this).parent().parent().find(\'input\').click();" class="plus big click icon"></i></div><img src="imgs/black.png" class="ui tiny list image"><input id="{1}" type="file" value="upload" style="display: none;"></div>';

                const columnId = 'ImageColumn' + ad_QtdRegisterImages;
                const inputId = 'ImageInput' + ad_QtdRegisterImages;

                imageCard = imageCard.replace('{0}', columnId);
                imageCard = imageCard.replace('{1}', inputId);

                $("#ImagesGrid").append(imageCard);
                
                $('#' + inputId).parent().find('img').attr('src', item);

                ad_Register_RemoveLoadingIconFromImage('#' + inputId);

                ad_QtdRegisterImages = ad_QtdRegisterImages + 1;
                
            });
            ad_showFields();
            //$('#divloader').remove();
        };

        db_get(adPath, onSucess, ad_ErrorFunction, ad_ErrorFunction);
    } else {
        ad_showFields();    
    }
}

const ad_update = function(){
    const adUID = misc_GetUrlParam('uid');
    db_InsertAdRegistration('yes', adUID);
}
///////////////////////////////// ADS UPDATE /////////////////////////////////

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
    const addImage = '<div class="four wide column product_image"><a href="ad_detail.html?uid={0}"><img src="{1}" class="ui tiny rounded image list"></a></div>';
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

const ads_GetFilterFields = function(byUrl) {
    var fields = {};

    if (!byUrl) {
        fields['searchTerm'] = $('#filter_term').val();
        fields['category'] = $("input[name='filter_category']:checked").val();
        fields['state'] = $('#filter_state').dropdown('get value');
        fields['city'] = $('#filter_city').dropdown('get value');
        fields['subcategory'] = $('#filter_Subcategory').dropdown('get value');
        fields['minprice'] = $('#filter_minprice').val();
        fields['maxprice'] = $('#filter_maxprice').val();
    } else {
        fields['searchTerm'] = misc_GetUrlParam('searchTerm');
        fields['category'] = misc_GetUrlParam('category');
        fields['state'] = misc_GetUrlParam('state');
        fields['city'] = misc_GetUrlParam('city');
        fields['subcategory'] = misc_GetUrlParam('subcategory');
        fields['minprice'] = misc_GetUrlParam('minprice');
        fields['maxprice'] = misc_GetUrlParam('maxprice');
    }

    return fields;
}

const ads_ApplyFilter = function() {
    const fields = ads_GetFilterFields(false);

    misc_GoToPage('ad_search.html?searchTerm=' + fields['searchTerm'] + '&state=' + fields['state'] + '&city=' + fields['city'] +
        '&subcategory=' + fields['subcategory'] + '&category=' + fields['category'] + '&minprice=' + fields['minprice'] + '&maxprice=' + fields['maxprice']);
};

const ads_IsObjectFiltersValid = function(filters, obj) {
    var searchTerm = misc_LowerCase(filters['searchTerm']);
    var title = misc_LowerCase(obj['title']);
    if (title.includes(searchTerm) == false) { return false; }

    if (filters['category']) {
        if (filters['category'] != obj['category']) { return false; }
    }

    if (filters['state']) {
        if (filters['state'] != obj['state']) { return false; }
    }

    if (filters['city']) {
        if (filters['city'] != obj['city']) { return false; }
    }

    if (filters['subcategory']) {
        if (filters['subcategory'] != obj['subcategory']) { return false; }
    }

    const price = misc_GetFloatNumber(obj['price']);
    
    if (filters['minprice']) {
        if (price < misc_GetFloatNumber(filters['minprice'])) { return false; }
    }

    if (filters['maxprice']) {
        if (price > misc_GetFloatNumber(filters['maxprice'])) { return false; }
    }

    return true;
};

const ads_List_ListAdsByTerm = function() {
    const firstCall = (lastAdUIDReceived == null);

    var onSucess = function(snapshot) {
        misc_RemoveLoader();
        const holder = $("#ads");
        const filters = ads_GetFilterFields(true);
        var cardAdded = false;
        
        $.each(snapshot.val(), function(uid, obj) {
            lastAdUIDReceived = uid;

            if (ads_IsObjectFiltersValid(filters, obj)) {
                cardAdded = true;

                ads_AddAdToDiv(snapshot, uid, obj, holder);
            }
        });

        // Not card add, we must display the Null value message
        if (!cardAdded) {
            holder.append(misc_GetNullValueMsg(true));
        }
    };

    const onError = function(snapshot) {
        if (misc_RemoveLoader()) {
            $("#ads").append(misc_GetErrorMsg(true));
        }
    };

    if (firstCall) {
        db_get("ad", onSucess, onError, onError);
    } else {
        console.log("ADD PAGINATION HERE");
    }
};

const ads_AddAdToDiv = function(snapshot, uid, obj, holder) {
    db_get("ads_images", function(snapshot) {
        const imgsRef = snapshot.val();
        const imgURL = imgsRef[uid][Object.keys(imgsRef[uid])[0]];

        ad_List_AddCardToList(holder, ad_GetAdCard(uid, imgURL, obj.title, obj.price, obj.description, true, false));
    }, null, null);
};

const ads_List_ListInnerJoinAdsOnDiv = function(div, qtdAdsToList, table, innerJoinTable) {
    const tableOne = rootRef.child(table);
    const path = localStorage.getItem('auth_UserUID');
    const tableTwo = rootRef.child(innerJoinTable);

    const onSucess = function(snapshot) {
        if (div) {
            misc_RemoveLoader(div);
            ads_AddAdToDiv(snapshot, snapshot.key, snapshot.val(), div);
        }
    };

    const onError = function(snapshot) {
        if (div) { div.remove(); }
    };

    db_getInnerJoinLimitToLast(tableOne, path, tableTwo, onSucess, onError, onError, true, qtdAdsToList);
};

const ads_List_ListLastAdsOnDiv = function(div, qtdAdsToList, table, fieldToOrder, fieldTestValue) {
    const onSucess = function(snapshot) {
        var cardAdded = false;
        
        $.each(snapshot.val(), function(uid, obj) {
            if (!fieldTestValue || obj[fieldToOrder] == fieldTestValue) {
                cardAdded = true;
                misc_RemoveLoader(div);
                ads_AddAdToDiv(snapshot, uid, obj, div);
            }
        });

        // Not card add, we must remove the category
        if (!cardAdded) {
            div.remove();
        }
    };

    const onError = function(snapshot) {
        div.remove();
    };

    db_getOrderByChildLimitToLast(table, fieldToOrder, qtdAdsToList, onSucess, onError, onError);
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
const ad_AddLastViewedAd = function(timestamp, uid) {
    const userUID = localStorage.getItem('auth_UserUID');
    
    rootRef.child('user_last_viewed_ads').child(userUID).child(timestamp).set(uid);  
};

const ad_FillDetailPage = function(adUID){
    const edit = misc_GetUrlParam('isitforEdit');
    const user = localStorage.getItem('auth_UserUID');
    var adPath = 'ad/' + adUID;

    var onSucess = function(snapshot) {
        var val = snapshot.val();

        db_get("ads_images", 
            function(snapshot) {
                const imgsRef = snapshot.val();
                const imgURL = imgsRef[adUID][Object.keys(imgsRef[adUID])[0]];
                ad_ValuesIntoDetail(val,imgURL);
            }, null, null);

        if (val.user == user) {
            document.getElementById("SendMessage").style.visibility = "hidden";
        }

        ad_AddLastViewedAd(Date.now(), adUID);
    };

    db_get(adPath, onSucess, ad_ErrorFunction, ad_ErrorFunction);

    if(!edit){
        document.getElementById("EditAd").style.visibility = "hidden";
    }
};

const ad_ValuesIntoDetail = function(val, imgURL) {
    const edit = misc_GetUrlParam('isitforEdit');
    var id = "";
    if (edit){
        title.value = val.title;
        description.value = val.description;
        if(val.category === 'produtos'){
            products.checked = true;
            id = "products";
        }else if (val.category === 'serviÃ§os'){
            services.checked = true;
            id = "services";
        } else {
            events.checked = true;
            id = "events";
        }
        ad_selectedType(id);
        //ad_GetCategory();
        $('#subcategory').dropdown('set selected', val.subcategory);
        price.value = val.price;
        locationad.value = val.location;
        cep.value = val.cep;
        tel.value = val.tel;
        $('#statead').dropdown('set selected', val.state);
        setTimeout( function(){
            $('#cityad').dropdown('set selected', val.city);
        }, 2000);
        if (val.category === "eventos"){
            datead.value = val.event_date;
            sitead.value = val.event_site;
            urlad.value = val.event_url;
        }
    } else {
        image.src = imgURL;
        title.innerText = val.title;
        address.innerText = val.location;
        price.innerText = "R$ " + val.price;
        description.innerText = val.description;
        category.innerText = val.category;
        subcategory.innerText = val.subcategory;

        db_get('/users/'+val.user, 
            function(snapshot) {
                const valUser = snapshot.val();
                console.log(valUser);
                $("#name").text(valUser.name);
                $("#district").text(valUser.district);
                console.log(valUser.district);
                //$("#district").text(valUser.district + ", " + valUser.city);
                $("#email").text(valUser.email);
                $("#phone").text(valUser.phone);
                ad_showFields();
            }
            , null
            , null
        );
        
        if (firebase.auth().currentUser.uid == val.user) {
            document.getElementById("EditAd").style.visibility = "visible";
        } else {
            document.getElementById("SendMessage").style.visibility = "visible";
        }

    }
};

const ad_ErrorFunction = function(error) {
    misc_DisplayErrorMessage('Erro ao exibir anÃºncio', 'Favor tentar mais tarde');
};

/////////////////////////////////  AD DETAIL /////////////////////////////////
/////////////////////////////////  AD LIST   /////////////////////////////////

const ad_List_ListAdsByUser = function(term) {
    const getUser = localStorage.getItem('auth_UserUID');
    const firstCall = (lastAdUIDReceived == null);

    var onSucess = function(snapshot) {
        misc_RemoveLoader();
        
        const holder = $("#ads");
        $.each(snapshot.val(), function(uid, obj) {
            lastAdUIDReceived = uid;

            db_get("ads_images",
                function(snapshot) {
                    const imgsRef = snapshot.val();
                    const imgURL = imgsRef[uid][Object.keys(imgsRef[uid])[0]];
                    
                    ad_List_AddCardToList(holder, ad_GetAdCard(uid, imgURL, obj.title, obj.price, obj.description, true, false));                                           
                }, null, null);
        });
    };

    const onError = function(snapshot) {
        if (misc_RemoveLoader()) {
            $("#ads").append(misc_GetErrorMsg(true));
        }
    };

    if (firstCall) {
        //TODO: Change "title" to "timestamp", when this field is added to database, so we can order the ads list by their creation date.
        if(term == "mylist"){
            db_getOrderByChildContainsLimitToLast("ad", "user", getUser, 50, onSucess, onError, onError);
        }else if(term == "myfavs"){
            db_getOrderByChildContainsLimitToLast("ad", "favorite", 1, 50, onSucess, $("#adlistfav").append("<div> Pagina em desenvolvimento </div>"), misc_RemoveLoader());
        }     
        
        //db_get("ad", onSucess, onError, onError);
    } else {
        console.log("ADD PAGINATION HERE");
    }
};

/////////////////////////////////  AD LIST   /////////////////////////////////

/////////////////////////////////  AD DELETE   /////////////////////////////////
const ad_delete = function(){
    const adUID = misc_GetUrlParam('uid');

    //remove add
    db_delete('ad/' + adUID);

    //Remove images from storage
    var onSucess = function(snapshot) {       
        $.each(snapshot.val(), function(uid, obj) {

            var imgfordel = obj.substring(obj.indexOf('%2F') + 3);

            imgfordel = imgfordel.substring(0, 20);
            
            db_deleteFromStorage(imgfordel, null);
        });
        
        //After remove all images from storage
        db_delete('ads_images/' + adUID);
        misc_GoToPage('ad_list.html');
    };
    db_get("ads_images/" + adUID, onSucess, null, null);
}
/////////////////////////////////  AD DELETE   /////////////////////////////////