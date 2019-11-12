/* This file is dedicate to store all logic part about ad_registration interface */

var adFormAction = "";

const ad_initComponent = function() {
    $('form.ad_register')
        .form({
            fields: {
                title: {
                  identifier: 'title',
                  rules: [{
                    type: 'empty',
                    prompt: 'Preencha o título do anúncio!'
                  }]
                },
                description: {
                  identifier: 'description',
                  rules: [{
                    type: 'empty',
                    prompt: 'Descreva detalhes do anúncio!'
                  }]
                }
            },
            onSuccess: function(event){
                event.preventDefault();
                ad_ExecuteLoaderButton("add");
                ad_ExecuteFormAction(adFormAction);   
            },
            onError: function(event){
                ad_ExecuteLoaderButton("remove");
            }
        });
    $('#findkmlfile').change(ad_SetKmlFileName);
}

const ad_ValidateFields = function(id){
    ad_initComponent();

    if (( id == "products")||( id == "services")||(id == "events")){
        $('form.ad_register')
            .form('add rule', 'price',{
              rules: [{
                type: 'empty',
                prompt: 'Favor preencher o preço!'
              }]
            });
    }
    if (id == "events"){
        $('form.ad_register')
            .form('add rule', 'datead',{
              rules: [{
                type: 'regExp[/^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}$/g]',
                prompt: 'Favor selecionar uma data!'
              }]
            });
    }
}

const ad_UpdateLoaderFromButton = function(){

}

const ad_showFields = function() {
    misc_RemoveLoader();
    $(".ui.container").show();
}

const ad_GetFirstImageFromAdSlider = function() {
    return $('#sliderImages').find('li').find('img').attr('src');
};

///////////////////////////////// AD REG /////////////////////////////////
const ad_SetAdParent = function(adTableRef, adUID, value) {
    adTableRef.child(adUID).child('ad_parent').set(value);
};

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
};

const ad_selectedType = function(id){
    if (id == 'farm') {
        ad_SetFarmFields();
    }

    $('#' + id).prop('checked', 'true').prop('disabled', false);

    if (id === 'events') { 
        $('.field.events').removeClass('hidden');
    }
    
    ad_GetCategory();
    ad_ValidateFields(id);

    $('.ui.modal').modal('hide');
};


//-- ADS KML REG --//

const ad_openFileDialog = function(){
  $('#findkmlfile').click();
}

const ad_SetKmlFileName = function(evt){

    $("#kmlfile").val(evt.target.files[0].name);

}

const db_GetKmlInfoFromAd = function(adUID){
    const path = "/ads_kmlfile/" + adUID + "/name";

    const onFake = function(){
        $("#kmlfile").val("");
        return;
    };

    const onSuccess = function(snapshot){
        var urlFromDb = snapshot.val();
        $("#kmlfile").val(urlFromDb);            
    };
    db_get(path, onSuccess, onFake, onFake);
}

//---------------------//

const ad_GetSelectedCaterogy = function(){

    var category = "";

    if (products.checked == true) {
        category = products.value;
    } else if (services.checked == true) {
        category = services.value;
    } else if (farm.checked == true) {
        category = farm.value;
    } else {
        category = events.value;
    }
    return category;
}

const db_InsertAdRegistration = function(flagUpdate, adUID) {
    // Test if there is any image being uploaded

    if (ad_UploadingImage > 0) {
        misc_DisplayErrorMessage('Imagem carregando', 'Favor aguardar todas as imagens finalizarem o upload');
        ad_ExecuteLoaderButton("remove");
        return;
    }

    if (ad_CurrentlyAddedImages.length == 0) {
        misc_DisplayErrorMessage('Nenhuma imagem', 'Favor adicionar ao menos uma imagem para efetuar o cadastro do anÃºncio.');
        ad_ExecuteLoaderButton("remove");
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

    var category = ad_GetSelectedCaterogy();

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
        timestamp: firebaseDateNow
    };

    var pageToRedirect = 'ad_detail.html?uid=' + key;
    if (category === "eventos") {
        var event_date = document.getElementById('datead').value;
        var event_site = document.getElementById('sitead').value;
        var event_url = document.getElementById('urlad').value;

        dataToInsert.event_date = event_date;
        dataToInsert.event_site = event_site;
        dataToInsert.event_url = event_url;
    } else if (category === "fazendas") {
        pageToRedirect = 'ad_registration_childrens.html?uid=' + key + '&nextStep=ad_detail';
    }

    if (!flagUpdate) {
        ad_Register_SaveImagePathToDB(key, ad_CurrentlyAddedImages);
        db_set(path, dataToInsert);
        db_InsertAdRegistrationOnUsers(key);
    } else if(flagUpdate == 'yes') {
        ad_Register_SaveImagePathToDB(key, ad_CurrentlyAddedImages);
        db_update(path, dataToInsert, );
    }

    if (category === "fazendas") {
        db_saveKmlFile(key).then((msg) => {
            console.log(msg);
            auth_RequireLoggingToAccess(pageToRedirect);
        });
    } else {
        auth_RequireLoggingToAccess(pageToRedirect);
    }
};

const ad_Register_SaveImagePathToDB = function(adUID, imagesArray) {
    var path = 'ads_images/' + adUID;
    var adImagesRef = db.ref(path);

    for (var i = 0; i < imagesArray.length; i++) {
        const imageKey = (imagesArray[i].key) ? (imagesArray[i].key) : (db_GetNewPushKey(path));
        const imageUrl = (imagesArray[i].key) ? (imagesArray[i].url) : (imagesArray[i]);
        adImagesRef.child(imageKey).set(imageUrl);
    }
};

var db_InsertAdRegistrationOnUsers = function(key){
    var path = 'user_ad/' + localStorage.getItem('auth_UserUID') + '/ad/' + key;
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
    values.push({ name : 'Manutenção de Maquinário', value : 'Manutenção de Maquinário' });
    values.push({ name : 'Médico Veterinário', value : 'Médico Veterinário' });
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

    values.push({ name : 'Orgânicos', value : 'Orgânicos' });
    values.push({ name : 'Proteí­na', value : 'Proteí­na' });
    values.push({ name : 'Vegetais', value : 'Vegetais' });
    values.push({ name : 'Frutas', value : 'Frutas' });
    values.push({ name : 'Laticí­nios', value : 'Laticí­nios' });
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

    values.push({ name : 'Não-colaborativo', value : 'Não-colaborativo' });
    
    dropDownField.dropdown({ values: values });
};

const ad_GetCategory = function() {
    const products = document.getElementById('products');
    const services = document.getElementById('services');
    const events = document.getElementById('events');

    if (products.checked === true) {
        ad_InitDropDownWithProducts($('#subcategory'));
    } else if (services.checked === true) {
        ad_InitDropDownWithServices($('#subcategory'));                  
    } else if (events.checked === true) {
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
const ad_RedirectForEditAd = function() {
    //Get Uid of Ad
    const adUID = misc_GetUrlParam('uid');
    //Redirect user to edit page
    misc_GoToPage("ad_registration.html?isitforEdit=1&uid=" + adUID);
};

const ad_RequestAdAccessOnFarm = function() {
    const userID = localStorage.getItem('auth_UserUID');

    if (userID) {
        $("#RequestAdAccessOnFarm").addClass("disabled");

        const adUID = misc_GetUrlParam('uid');
        const path = 'ad/' + adUID + '/user';

        var onError = function(snapshot) {
            misc_DisplayErrorMessage('Erro ao enviar o pedido', 'Algo aconteceu, tente novamente mais tarde.');
            $("#RequestAdAccessOnFarm").removeClass("disabled");
        };

        var onSucess = function(snapshot) {
            const ownerUID = snapshot.val();
            ad_SendRequestAdAccessOnFarm(ownerUID, userID, adUID, onError);
        };

        db_get(path, onSucess, onError, onError);
    } else {
        misc_DisplayErrorMessage('Usuário não logado', 'Por favor faça o login para realizar essa ação.');
    }
};

const ad_SendRequestAdAccessOnFarm = function(ownerUID, userID, adUID, onError) {
    const path = 'ad_accessOnFarmRequest/' + ownerUID + '/' + adUID;

    var doActionOfSending = function() {
        rootRef.child('ad_accessOnFarmRequest').child(ownerUID).child(adUID).push(userID);  
        misc_DisplaySuccessMessage("Pedido enviado com sucesso!", "Aguarde o anúnciante responder.");
    };

    var onSucess = function(snapshot) {
        var alreadySentRequest = false;
        
        snapshot.forEach(function(val) {
            if (val.val() == userID) {
                alreadySentRequest = true;
            }
        });

        if (!alreadySentRequest) {
            doActionOfSending();
        } else {
            misc_DisplayErrorMessage('Pedido duplicado', 'Você já enviou uma solicitação para esse anúncio!');
        }
    };

    var onNullValue = function(snapshot) {
        doActionOfSending();
    };

    db_get(path, onSucess, onNullValue, onError);
};

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
                var item = {
                    url : childSnapshot.val(),
                    key : childSnapshot.key
                };

                ad_CurrentlyAddedImages.push(item);

                var imageCard = '<div class="five wide column row" id="{0}"><div class="ui active inverted dimmer"><i onclick="$(this).parent().parent().find(\'input\').click();" class="plus big click icon"></i></div><img src="imgs/black.png" class="ui tiny list image"><input id="{1}" type="file" value="upload" style="display: none;"></div>';

                const columnId = 'ImageColumn' + ad_QtdRegisterImages;
                const inputId = 'ImageInput' + ad_QtdRegisterImages;

                imageCard = imageCard.replace('{0}', columnId);
                imageCard = imageCard.replace('{1}', inputId);

                $("#ImagesGrid").append(imageCard);
                
                $('#' + inputId).parent().find('img').attr('src', item.url);

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

const ad_GetCardByUid = function(holder, uid) {
    var onSucess = function(snapshot) {
        $.each(snapshot.val(), function(uid, obj) {
            db_get("ads_images", function(snapshot) {
                const imgsRef = snapshot.val();
                const imgURL = imgsRef[uid][Object.keys(imgsRef[uid])[0]];
                
                ad_List_AddCardToList(holder, ad_GetAdCard(uid, imgURL, obj, false, false, false)); 
            }, null, null);
        });
    };

    const onError = function(err) { };
    db_getEqualToIndex('ad', uid, onSucess, onError, onError);
}

const ad_GetAdCard = function(uid, image, obj, showFavoriteButton, favoriteSelected, showCheckbox, requestInfo) {
    const addImage = '<div adId="{11}" {12} class="four wide column product_image"><a href="{0}"><img src="{1}" class="ui tiny rounded image list"></a></div>';
    const addInfo  = '<div adId="{11}" {12} class="twelve wide column product_info"><a href="{2}"><h4 id="title">{3}</h4></a>{9}<h3 id="price">{7}</h3><span id="info">{8}</span>{10}<div style="width: 100%;" class="ui divider"></div></div>';

    var link = 'ad_detail.html?uid=' + uid;
    var card = addImage + addInfo;
    var const10Value = '';

    if (showCheckbox) {
        // IF SHOWCHECKBOX disable links
        link = "#";
        // USE SEMANTIC ON FUTURE VERSION
        //const item = '<div class="ui checkbox big"><input type="checkbox"></div>';

        const selected = (obj.ad_parent != null && obj.ad_parent != '') ? 'checked' : '';
        const item = '<input ' + selected + ' type="checkbox" name="checkAd" value="' + uid + '" class="favoriteItem">';

        card = card.replace('{9}', item);
    } else {
        card = card.replace('{9}', '<i onclick="ads_List_FavoriteAdClick(this);" uid="{4}" class="red large link {5} {6} icon favoriteItem"></i>');
        card = card.replace('{5}', (showFavoriteButton) ? "heart" : "");
    }

    if (requestInfo) {
        const methodCallParams = "this, '" + uid + "', " + "'" + requestInfo.requesterID + "','" + requestInfo.randomUid + "'";
        const acceptOption = '<div class="accessRequestContent"><p>Liberar acesso à {0}?</p><div class="ui buttons"><button {13} class="ui green icon button"><i class="icon thumbs up" onclick="ad_AccessRequestAccept({1});"></i></button><div class="or" data-text="ou"></div><button {14} class="ui red icon button" onclick="ad_AccessRequestDeny({2});"><i class="icon thumbs down"></i></button></div></div>';

        const10Value = acceptOption;
        const10Value = const10Value.replace('{0}', requestInfo.requesterName);
        const10Value = const10Value.replace('{1}', methodCallParams);
        const10Value = const10Value.replace('{2}', methodCallParams);
        
        // SET BUTTON ID
        const btnID = 'buttonID="' + Math.random() + '"';
        card = card.replace('{12}', btnID);
        card = card.replace('{12}', btnID);
        const10Value = const10Value.replace('{13}', btnID);
        const10Value = const10Value.replace('{14}', btnID);
    } else {
        card = card.replace('{12}', '');
    }

    card = card.replace('{0}', link);
    card = card.replace('{1}', image);
    card = card.replace('{2}', link);
    card = card.replace('{3}', obj.title);
    card = card.replace('{4}', uid);
    card = card.replace('{6}', (favoriteSelected) ? "" : "outline");
    card = card.replace('{7}', (obj.category != 'fazendas') ? misc_GetPrice(obj.price) : "&nbsp;");
    card = card.replace('{8}', misc_GetStringWithMaxCharacthers(obj.description, 40));
    card = card.replace('{10}', const10Value);
    card = card.replace('{11}', uid);
    card = card.replace('{11}', uid);

    return card;
};

const ad_List_AddCardToList = function(holder, card) {
    holder.append(card);
};

const ads_GetFilterFields = function(byUrl) {
    var fields = {};

    if (!byUrl) {
        fields['searchTerm'] = $('#filter_term').val();
        fields['category'] = $("input[name='filter_category']:checked").val();
        fields['state'] = $('#filter_state').dropdown('get text');
        fields['city'] = $('#filter_city').dropdown('get text');
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
        if (filters['category'] != obj['category']) { console.log('2'); return false; }
    }
    
    if (filters['state']) {
        if (filters['state'] != obj['state']) { return console.log(filters['state'] + ' - ' + obj['state']); false; }
    }
    
    if (filters['city']) {
        if (filters['city'] != obj['city']) { console.log('3'); return false; }
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

    var A = false;
    var onSucess = function(snapshot) {
        misc_RemoveLoader();
        const holder = $("#ads");
        const filters = ads_GetFilterFields(true);
        var cardAdded = false;
        
        if (A == false)
        {
            A = true;
            console.log(filters['searchTerm']);
        }
        $.each(snapshot.val(), function(uid, obj) {
            lastAdUIDReceived = uid;

            if (ads_IsObjectFiltersValid(filters, obj)) {
                cardAdded = true;

                ads_AddAdToDiv(snapshot, uid, obj, holder);
                misc_SchedulePageSave(2000);
            }
        });

        // Not card add, we must display the Null value message
        if (!cardAdded) {
            holder.append(misc_GetNullValueMsg(true));
        }
    };

    const onError = function(snapshot) {
        console.log(snapshot);
        if (misc_RemoveLoader()) {
            $("#ads").append(misc_GetErrorMsg(true));
        }
    };

    if (firstCall) {
        db_get("ad", onSucess, onError, onError);
    } else {
        //console.log("ADD PAGINATION HERE");
    }
};

const ads_AddAdToDiv = function(snapshot, uid, obj, holder) {
    db_get("ads_images", function(snapshot) {
        const imgsRef = snapshot.val();
        const imgURL = imgsRef[uid][Object.keys(imgsRef[uid])[0]];

        ad_List_AddCardToList(holder, ad_GetAdCard(uid, imgURL, obj, true, false));
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

        misc_UpdatePageReady();
    };

    const onError = function(snapshot) {
        if (div) { div.remove(); }
        misc_UpdatePageReady();
    };

    if (path != null)  {
        db_getInnerJoinLimitToLast(tableOne, path, tableTwo, onSucess, onError, onError, true, qtdAdsToList);
    } else {
        onError(null);
    }
};

const ads_List_ListLastAdsOnDiv = function(div, limitToLast, table, fieldToOrder, fieldTestValue) {
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

        misc_UpdatePageReady();
    };

    const onError = function(snapshot) {
        div.remove();
        misc_UpdatePageReady();
    };

    if (!fieldTestValue) {
        db_getOrderByChildLimitToLast(table, fieldToOrder, limitToLast, onSucess, onError, onError);
    } else {
        db_getEqualToLimitToLast(table, fieldToOrder, fieldTestValue, limitToLast, onSucess, onError, onError);
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
    //Fav an Ad.

    const ad = uid;
    const user = localStorage.getItem('auth_UserUID');
    const path = 'users_favorites/' + user + '/' + ad;
    const pathAd = 'ad/' + ad;
    const tableone = rootRef.child('ad');

    
    var onSuccess = function (snapshot){
        const favsRef = snapshot.val();
        const title = favsRef.title;
        const price = favsRef.price;
        const description = favsRef.description;

        var dataToInsert = {
            user: user,
            ad: ad,
            title: title,
            price: price,
            description: description,
            timestamp: firebaseDateNow
        };

        db_set(path, dataToInsert);
    };

    db_get(pathAd, onSuccess, null, null);
};

const ads_List_UnfavoriteAd = function(uid) {
    
    const user = localStorage.getItem('auth_UserUID');
    const path = 'users_favorites/' + user + '/' + uid;

    //Unfavorite Ad
    db_delete(path);
};

///////////////////////////////// ADS SEARCH /////////////////////////////////
/////////////////////////////////  AD DETAIL /////////////////////////////////
const ad_AddLastViewedAd = function(timestamp, uid) {
    const userUID = localStorage.getItem('auth_UserUID');
    
    if (userUID) {
        rootRef.child('user_last_viewed_ads').child(userUID).child(timestamp).set(uid);
    }
};

const ad_addSliderItem = function(item){
    var htmlSlider = "<li class='slider__slides glide__slides'><img src='{0}'></li>";
    var htmlBullet = "<button class='slider__bullet glide__bullet' data-glide-dir='={0}')></button>"

    htmlBullet = htmlBullet.replace("{0}", item.key);
    htmlSlider = htmlSlider.replace("{0}", item.value);

    $("#sliderImages").append(htmlSlider);
    $("#bulletImages").append(htmlBullet);
};

const ad_addSliderVideo = function(ivideo){
    $('#youtubeVideo').embed({
        source      : 'youtube',
        //placeholder : '/images/bear-waving.jpg',
        id          : ivideo        
    }).removeClass('hidden');
};

const ad_SetFarmFields = function() {
    $('.notFarm').addClass('hidden');
    $('.isFarm').removeClass('hidden');
};


const ad_FillDetailPage = function(adUID) {
    const edit = misc_GetUrlParam('isitforEdit');
    const user = localStorage.getItem('auth_UserUID');
    var adPath = 'ad/' + adUID;

    var hideAdAccessOnFarm = function() {
        $("#RequestAdAccessOnFarm").addClass("hidden");
    };

    var onSucess = function(snapshot) {
        var val = snapshot.val();

        var onGetServerTime = function(serverTime) {
            ad_AddLastViewedAd(serverTime, adUID);    
        };
        db_GetServerTime(onGetServerTime);

        if (val.category === 'fazendas') {
            ad_SetFarmFields();
            db_GetKmlInfoFromAd(adUID);
            ad_LoadAdsListOnDiv('EqualToLimitToLast', $('#farmChildren'), 'ad_parent', snapshot.key, 100);
            hideAdAccessOnFarm();
        } else {
            if (val.ad_parent) {
                ad_GetCardByUid($('#farmCard'), val.ad_parent);
                hideAdAccessOnFarm();
            }
        }

        if (val.user == user) {
            hideAdAccessOnFarm();
            $("#EditAd").removeClass("hidden");
        }

        if (!edit) {
            var counter = 0;
            var imgPath = "ads_images/" + adUID;
            
            db_get(imgPath, 
                function(snapshot) {
                    snapshot.forEach(function(imageUrl){
                        var item = {
                            key : counter,
                            value : imageUrl.val()
                        };
                        ad_addSliderItem(item);
                        counter++;

                    })
                    //const imgsRef = snapshot.val();
                    //const imgURL = imgsRef[adUID][Object.keys(imgsRef[adUID])[0]];
                    ad_ValuesIntoDetail(val, (counter-1));
                }, ad_ErrorFunction, ad_ErrorFunction
            );

            if (val.user == user) {
                $("#SendMessage").addClass("hidden");
            }

        } else {
            ad_ValuesIntoDetail(val, null);
        }
    };

    db_get(adPath, onSucess, ad_ErrorFunction, ad_ErrorFunction);
};

const ad_InitGlide = function(icounter){

    var autoplayValue = 0;

    (icounter == 0) ? autoplayValue : autoplayValue = 3000;

    var glide = new Glide('#intro', {
      type: 'slider',
      autoplay: autoplayValue,
      perView: 4,
      focusAt: 'center',
      breakpoints: {
        800: {
          perView: 2
        },
        480: {
          perView: 1
        }
      }
    });

    glide.mount();
};

const ad_ValuesIntoDetail = function(val, icounter) {
    const edit = misc_GetUrlParam('isitforEdit');
    var id = "";

    if (edit) {
        title.value = val.title;
        description.value = val.description;
        if(val.category === 'produtos'){
            products.checked = true;
            id = "products";
        } else if (val.category === 'servicos'){
            services.checked = true;
            id = "services";
        } else if (val.category === 'fazendas'){
            farm.checked = true;
            id = "farm";
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
            sitead.value = val.event_site;
            datead.value = val.event_date;
            urlad.value = val.event_url;
        }
    } else {
        //image.src = imgURL;
        title.innerText = val.title;
        address.innerText = val.location;
        price.innerText = "R$ " + val.price;
        description.innerText = val.description;
        category.innerText = val.category;
        subcategory.innerText = val.subcategory;
        if (val.category === "eventos"){
            datead.innerText = val.event_date;            
            (val.event_site) ? ($("#urlad").prop("href", "http://" + val.event_site)) : (undefined);
            (val.event_url) ? (ad_addSliderVideo(val.event_url)) : (undefined);
            $('#adevents').each(function() {
                $(this).removeClass('hidden');
            });
        }

        db_get('/users/'+val.user, 
            function(snapshot) {
                const valUser = snapshot.val();
                $("#name").text(valUser.name);
                $("#district").text(valUser.district);
                //$("#district").text(valUser.district + ", " + valUser.city);
                $("#email").text(valUser.email);
                $("#phone").text(valUser.phone);
                ad_showFields();
                ad_InitGlide(icounter);
            }
            , ad_ErrorFunction
            , ad_ErrorFunction
        );

        
        if ((firebase.auth().currentUser)&&(firebase.auth().currentUser.uid == val.user)) {
            document.getElementById("EditAd").style.visibility = "visible";
        } else {
            document.getElementById("SendMessage").style.visibility = "visible";
        }

        misc_SchedulePageSave(1000);
    }
};

const ad_ErrorFunction = function(error) {
    misc_DisplayErrorMessage('Erro ao exibir anúncio', 'Favor tentar mais tarde');
};

const ad_LoadAdsListOnDiv = function(searchType, holder, orderByChild, orderByChildValue, limitToLast) {
    var onSucess = function(snapshot) {
        misc_RemoveLoader();
        
        $.each(snapshot.val(), function(uid, obj) {
            const onErr = function(snapshot) {};
                
            db_get("ads_images", function(snapshotImage) {
                const imgsRef = snapshotImage.val();
                const imgURL = imgsRef[uid][Object.keys(imgsRef[uid])[0]];
                
                ad_List_AddCardToList(holder, ad_GetAdCard(uid, imgURL, obj, false, false, false)); 
                misc_SchedulePageSave(1000);
            }, onErr, onErr);
        });
    };

    const onError = function(snapshot) {
        if (misc_RemoveLoader()) {
            holder.append(misc_GetErrorMsg(true));
        }
    };

    if (searchType == 'ChildContainsLimitToLast') {
        db_getOrderByChildContainsLimitToLast("ad", orderByChild, orderByChildValue, limitToLast, onSucess, onError, onError);
    } else if (searchType == 'EqualToLimitToLast') {
        db_getEqualToLimitToLast("ad", orderByChild, orderByChildValue, limitToLast, onSucess, onError, onError);
    }
}

// Function to init Google Maps API. This needs to be like function ad_InitMap() standard
function ad_InitMap() {
    var file_path = '/ads_kmlfile/' + misc_GetUrlParam('uid') + '/url';
    var srcKml = "";

    const onFake = function(){
        return;
    };

    const onSuccess = function(snapshot){
        srcKml = snapshot.val();
        console.log(srcKml);
    
        if (!srcKml)
            srcKml = 'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml';

        var map = new google.maps.Map(document.getElementById('map'), {
            center: new google.maps.LatLng(-19.257753, 146.823688),
            zoom: 2,
            mapTypeId: 'terrain'
        });

        var kmlLayer = new google.maps.KmlLayer(srcKml, {
            suppressInfoWindows: true,
            preserveViewport: false,
            map: map
        });
    };
    db_get(file_path, onSuccess, onFake, onFake);
};

/////////////////////////////////  AD DETAIL /////////////////////////////////
/////////////////////////////////  AD LIST   /////////////////////////////////
const ad_List_ListAdsByUser = function(term, enableCheckboxOnCards) {
    const getUser = localStorage.getItem('auth_UserUID');

    if (!getUser) { misc_GoToHome(); }

    const firstCall = (lastAdUIDReceived == null);
    const urlParamUID = misc_GetUrlParam('uid');
    
    var onSucess = function(snapshot) {
        var snapKey = snapshot.key;
        var snapVal = snapshot.val();
        
        misc_RemoveLoader();
        const holder = $("#ads");
        const loadProduct = function(uid, obj) {
            const onErr = function(snapshot) {};
                
            // This IF test if farms are enableb on this search or not
            var canAdd = true;
            if (canAdd && ((term == "mylistNoFarms" || term == "mylistNoFarmsNoParents") && obj.category == 'fazendas')) { canAdd = false; }
            if (canAdd && term == "mylistNoFarmsNoParents") { 
                if (obj.ad_parent != null && obj.ad_parent != urlParamUID) {
                    canAdd = false;
                }
            }

            //if (term != "mylistNoFarms" || ((term == "mylistNoFarms" || term == "mylistNoFarmsNoParents") && obj.category != 'fazendas')) {
            //if ((term == "mylistNoFarmsNoParents" && obj.ad_parent == null) || term != "mylistNoFarmsNoParents") {

            if (canAdd) {
                lastAdUIDReceived = uid;
                pageReadyDesired++;

                db_get("ads_images",
                    function(snapshot) {
                        const imgsRef = snapshot.val();
                        const imgURL = imgsRef[uid][Object.keys(imgsRef[uid])[0]];
                        
                        if (term == "myfavs") {
                            ad_List_AddCardToList(holder, ad_GetAdCard(uid, imgURL, obj, false, true, enableCheckboxOnCards)); 
                            misc_UpdatePageReady();
                        }else {
                            ad_List_AddCardToList(holder, ad_GetAdCard(uid, imgURL, obj, false, false, enableCheckboxOnCards)); 
                            misc_UpdatePageReady();
                        }
                    }, onErr, onErr);
            }
        }
        
        if (term == "myfavs") {
            $.each(snapVal, function(uid, obj) {
                loadProduct(uid, obj);
            });
        } else {
            loadProduct(snapKey, snapVal);
        }
    };

    const onError = function(snapshot) {
        if (misc_RemoveLoader()) {
            $("#ads").append(misc_GetErrorMsg(true));
        }
    };

    if (firstCall) {
        //TODO: Change "title" to "timestamp", when this field is added to database, so we can order the ads list by their creation date.
        if (term == "mylist" || term == "mylistNoFarms" || term == "mylistNoFarmsNoParents") {
            //db_getOrderByChildContainsLimitToLast("ad", "user", getUser, 50, onSucess, onError, onError);
            const pathInTableOne = "" + getUser + "/ad";
            const tableOne = rootRef.child("user_ad");
            const tableTwo = rootRef.child("ad");

            db_getInnerJoin(tableOne, pathInTableOne, tableTwo, onSucess, onError, onError);
        } else if(term == "myfavs") {
            var path = "users_favorites/" + getUser;
            db_get(path, onSucess, null, null);
        }
    } else {
        //console.log("ADD PAGINATION HERE");
    }
};
/////////////////////////////////  AD LIST   /////////////////////////////////

/////////////////////////////////  AD ACESS LIST   /////////////////////////////////
const ad_List_ListAdsAccessRequest = function() {
    const holder = $("#ads");
    const getUser = localStorage.getItem('auth_UserUID');

    if (!getUser) { misc_GoToHome(); }
    
    var onSucess = function(snapshot, snap) {
        misc_RemoveLoader();
        
        const adUid = snap.key;
        const adRequestersList = snap.val();

        const searchUserInfo = function(randomUid, requesterID, cardData) {
            const onUserInfoErr = function(snapshot) {
                misc_DisplayErrorMessage("Tente novamente!", "Erro ao consultar as informações do solicitante.")
            };

            const onUserInfoSuccess = function(userInfoSnapshot) {
                const requestInfo = {
                    requesterID: requesterID,
                    requesterName: userInfoSnapshot.val(),
                    randomUid: randomUid,
                }

                ad_List_AddCardToList(cardData.holder, ad_GetAdCard(cardData.uid, cardData.image, cardData.obj, cardData.showFavoriteButton, cardData.favoriteSelected, cardData.showCheckbox, requestInfo)); 
            };

            const userInfoPath = "users/" + requesterID + "/name";
            db_get(userInfoPath, onUserInfoSuccess, onUserInfoErr, onUserInfoErr);
        };

        uid = snapshot.key;
        obj = snapshot.val();
        
        const onErr = function(snapshot) {
            misc_DisplayErrorMessage("Tente novamente!", "Erro consultar a imagem de algum produto.")
        };

        db_get("ads_images",
            function(snapshot) {
                const imgsRef = snapshot.val();
                const imgURL = imgsRef[uid][Object.keys(imgsRef[uid])[0]];
                
                const cardData = {
                    holder: holder,
                    uid: uid,
                    image: imgURL,
                    obj: obj,
                    showFavoriteButton: false,
                    favoriteSelected: false,
                    showCheckbox: false
                }

                $.each(adRequestersList, function(uid, obj) {
                    searchUserInfo(uid, obj, cardData);
                });

                sw_SavePage();
            }
            ,onErr
            ,onErr
        );
    };

    const onError = function(snapshot) {
        if (misc_RemoveLoader()) {
            misc_DisplayErrorMessage("Tente novamente!", "Erro ao executar a consulta.")
        }
    };
    
    const onNull = function(snapshot) {
        if (misc_RemoveLoader()) {
            $("#ads").append(misc_GetNullValueMsg(true));
        }
    };

    const tableOne = rootRef.child("ad_accessOnFarmRequest");
    const tableTwo = rootRef.child("ad");
    db_getInnerJoin(tableOne, getUser, tableTwo, onSucess, onNull, onError);
};

const ad_AccessRequestAccept = function(event, uid, requesterId, randomUid) {
    // Remove all ads with same ID from page
    $('[adid="-LlPLpgrO9hcOs9URHIZ"]').remove();
    
    // Remove all requests for this AD from DB
    const userId = localStorage.getItem('auth_UserUID');
    rootRef.child('ad_accessOnFarmRequest').child(userId).child(uid).set(null);

    // Set AD into user table
    rootRef.child('user_ad').child(requesterId).child('ad').child(uid).set(uid);
    
    // Display success message
    misc_DisplaySuccessMessage("Pedido aceito com sucesso!", "Agora o solicitante poderá usar este anúncio.")
};

const ad_AccessRequestDeny = function(event, uid, requesterId, randomUid) {
    // Remove card from page
    $('[buttonID="'+ event.getAttribute('buttonid') + '"]').remove();
    
    // Remove only one request from DB
    const userId = localStorage.getItem('auth_UserUID');
    rootRef.child('ad_accessOnFarmRequest').child(userId).child(uid).child(randomUid).set(null);

    // Dispaly success message
    misc_DisplaySuccessMessage("Pedido recusado com sucesso!", "O solicitante não terá acesso a este anúncio.")
};
/////////////////////////////////  AD ACESS LIST   /////////////////////////////////
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
};
/////////////////////////////////  AD DELETE   /////////////////////////////////
/////////////////////////////////  AD SHARE   /////////////////////////////////
const ad_Share = function(social_network) {
    if (social_network == 'facebook') {
        url = 'https://www.facebook.com/sharer.php?display=popup&u=' + window.location.href;
        options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
        window.open(url,'sharer',options);
    }

    if (social_network == 'twitter') {
        url = 'https://twitter.com/share?url' + window.location.href;
        options = 'toolbar=0,status=0,resizable=1,width=626,height=436';
        window.open(url,'sharer',options);
    }
};
/////////////////////////////////  AD SHARE   /////////////////////////////////
/////////////////////////////////  Ads Classes ////////////////////////////////

//Command pattern to determine insert, update or delete ad
class Ad_LoaderButton{
    add(){
        $(".field .ui.button").each(function(){
            $(this).addClass("loading");
        });        
    }
    remove(){
        $(".field .ui.button").each(function(){
            $(this).removeClass("loading");
        });
    }
}

class Ad_Action {
  //constructor() {
  //  this._action = action;
  //}
  insert() {
    return db_InsertAdRegistration();
  }
  update() {
    return ad_update();
  }
  delete() {
    return ad_delete();
  }
}

class Command {
  constructor(subject) {
    this._subject = subject;
    this.commandsExecuted = [];
  }
  execute(command) {
    this.commandsExecuted.push(command);
    return this._subject[command]();
  }
}

const ad_ExecuteLoaderButton = function(loader){
    const action = new Command(new Ad_LoaderButton());
    action.execute(loader);
}

const ad_ExecuteFormAction = function(){
    const action = new Command(new Ad_Action());
    action.execute(adFormAction);
}

const ad_getFormAction = function(obj){
    adFormAction = obj.getAttribute('value');
}

/////////////////////////////////  Ads Classes ////////////////////////////////