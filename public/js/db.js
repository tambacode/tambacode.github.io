﻿var db, db_storage, rootRef, rootStorageRef = null;

if (navigator.onLine) {
    db = firebase.database();
    db_storage = firebase.storage()
    rootRef = db.ref();
    rootStorageRef = db_storage.ref();
}

//  Use to get a new key when inserting a new data on DB
//  path (string): 'GoFarmer/Users'
const db_GetNewPushKey = function(path) {
    var key = db.ref().child(path).push().key;
    return key;
};

// Use this to get the server time
const db_GetServerTime = function(callback) {
    db.ref("/.info/serverTimeOffset").on('value', function(offset) {
        var offsetVal = offset.val() || 0;
        var serverTime = Date.now() + offsetVal;

        callback(serverTime);
    });
}

/*
    Method used to insert a new value in some path
    path (string): 'GoFarmer/Users'
    postData (Json structure): 
        var dataToInsert = {
            name: 'John',
            age : 26
        };
*/

const db_set = function(path, postData) {
    db.ref(path).set(postData);
};

//https://firebase.google.com/docs/database/web/read-and-write
const db_update = function(path, postData, callback) {
    db.ref(path).update(postData,
        function (error){
            if (error === null)
                callback;
            else
                misc_DisplayErrorMessage("Cadastro","Cadastro não foi realizado");
        });
};

//Delete from database
const db_delete = function(path, callback) {
    db.ref(path).remove(
        function (error){
            if (error === null)
                callback;
            else
                misc_DisplayErrorMessage("Exclusão","Não foi possível excluir este anúncio");
        });
};

//Delete from storage
const db_deleteFromStorage = function(reference, onError){
        // Create a reference to the file to delete
        var desertRef = rootStorageRef.child('ads_images/' + reference);

        // Delete the file
        desertRef.delete().then(function() {
          // File deleted successfully
        }).catch(function(error) {
            onError(error);
        });
};

var db_get = function(path, onSucess, onNullValue, onError) {
    db.ref(path).once('value')
        .then(function(snapshot) {
            if (snapshot.val() == null)
            {
                onNullValue(snapshot);
            } else {
                onSucess(snapshot);
            }
        }).catch(function(error) {
            onError(error);
        });
};

const db_getOrderByChild = function(path, orderByChild, onSucess, onNullValue, onError) {
    db.ref(path).orderByChild(orderByChild).once('value')
        .then(function(snapshot) {
            if (snapshot.val() == null)
            {
                onNullValue(snapshot);
            } else {
                onSucess(snapshot);
            }
        }).catch(function(error) {
            onError(error);
        });
};

const db_getOrderByChildLimitToLast = function(path, orderByChild, limitToLast, onSucess, onNullValue, onError) {
    db.ref(path).orderByChild(orderByChild).limitToLast(limitToLast).once('value')
        .then(function(snapshot) {
            if (snapshot.val() == null)
            {
                onNullValue(snapshot);
            } else {
                onSucess(snapshot);
            }
        }).catch(function(error) {
            onError(error);
        });
};

const db_getOrderByChildContainsLimitToLast = function(path, orderByChild, containsString, limitToLast, onSucess, onNullValue, onError) {
    //.startAt(containsString)
    //.endAt(endAt + "\uf8ff")
    db.ref(path).orderByChild(orderByChild)
                .startAt(containsString)
                .endAt(containsString + "\uf8ff")
                .limitToLast(limitToLast).once('value')
        .then(function(snapshot) {
            if (snapshot.val() == null)
            {
                onNullValue(snapshot);
            } else {
                onSucess(snapshot);
            }
        }).catch(function(error) {
            onError(error);
        });
};

const db_getEqualToIndex = function(path, equalTo, onSucess, onNullValue, onError) {
    db.ref(path).orderByKey()
                .equalTo(equalTo)
                .once('value')
        .then(function(snapshot) {
            if (snapshot.val() == null)
            {
                onNullValue(snapshot);
            } else {
                onSucess(snapshot);
            }
        }).catch(function(error) {
            onError(error);
        });
};

const db_getEqualToLimitToLast = function(path, orderByChild, equalTo, limitToLast, onSucess, onNullValue, onError) {
    db.ref(path).orderByChild(orderByChild)
                .equalTo(equalTo)
                .limitToLast(limitToLast)
                .once('value')
        .then(function(snapshot) {
            if (snapshot.val() == null)
            {
                onNullValue(snapshot);
            } else {
                onSucess(snapshot);
            }
        }).catch(function(error) {
            onError(error);
        });
};

const db_getInnerJoinorderByValue = function(table1, pathInTableOne, table2, onSucess, onNullValue, onError) {
    table1.child(pathInTableOne).orderByValue().on('child_added', snap => {
        let lastInfoRef = table2.child(snap.key);
        
        lastInfoRef.once('value')
            .then(function(snapshot) {
                if (snapshot.val() == null)
                {
                    onNullValue(snapshot);
                } else {
                    onSucess(snapshot);
                }
            }).catch(function(error) {
                onError(error);
            });
    });
}

var scheduleInnerJoin = null;
var db_getInnerJoin = function(table1, pathInTableOne, table2, onSucess, onNullValue, onError, useValueToSearchOnChild) {
    table1.child(pathInTableOne).on('child_added', snap => {
        let lastInfoRef;
        if (useValueToSearchOnChild) {
            lastInfoRef = table2.child(snap.val());
        } else {
            lastInfoRef = table2.child(snap.key);
        }
        
        lastInfoRef.once('value')
            .then(function(snapshot) {
                clearTimeout(scheduleInnerJoin);
                if (snapshot.val() == null)
                {
                    onNullValue(snapshot);
                } else {
                    onSucess(snapshot, snap);
                }
            }).catch(function(error) {
                clearTimeout(scheduleInnerJoin);
                onError(error);
            });
    });

    scheduleInnerJoin = setTimeout(onNullValue, 2000);
};

const db_getInnerJoinLimitToLast = function(table1, pathInTableOne, table2, onSucess, onNullValue, onError, useValueToSearchOnChild, limitToLast) {
    table1.child(pathInTableOne)
        .limitToLast(limitToLast)
        .on('child_added', snap => {
            let lastInfoRef;
            if (useValueToSearchOnChild) {
                lastInfoRef = table2.child(snap.val());
            } else {
                lastInfoRef = table2.child(snap.key);
            }
            
            lastInfoRef.once('value')
                .then(function(snapshot) {
                    if (snapshot.val() == null)
                    {
                        onNullValue(snapshot);
                    } else {
                        onSucess(snapshot);
                    }
                }).catch(function(error) {
                    onError(error);
                });
    });
};

///////////////////////////////// USERS /////////////////////////////////
const db_InsertUserOnLogin = function(path, name, email, providerName, providerToken) {
    var dataToInsert = {
        name: name,
        email: email,
        profile_picture_link: '/imgs/default_profile_picture.png',
        tokens : {}
    };

    dataToInsert.tokens[providerName] = providerToken;

    db_set(path, dataToInsert);
};

const db_getUserToEdit = function() {
    var path = '/users/' + localStorage.getItem('auth_UserUID');

    var onSuccess = function(snapshot) {
        $.each(snapshot.val(), function(field, value ) {
            if (field === "state")
                $('#' + field).dropdown('set selected', value);
            if (field === "city"){
                setTimeout(function(){
                    $('#' + field).dropdown('set selected', value);
                }, 2000);
            }
            else if (field === "profile_picture_link" ) {
                if (value !== undefined) {
                    misc_waitImageLoadReady($('#imageuploaded'), value, function(){
                        user_showFields();
                        misc_RemoveLoader();
                    });
                }
            }
            else if (field === "pictureRotate") {
                if (value !== undefined) {
                    misc_SetImageRotation($('#imageuploaded'), value);
                }
            }
            else
                $('#' + field).val(value);
        });
    };

    var onNullValue = function(snapshot) {
        user_showFields();
        misc_RemoveLoader();
    };

    var onError = function(snapshot) {
        user_showFields();
        misc_RemoveLoader();
    };

    db_get(path, onSuccess, onNullValue, onError);
};

const db_getUserInfo = function() {
    const usedID = localStorage.getItem('auth_UserUID');

    if (usedID == null) {
        user_OpenProfile();
    }

    const path = '/users/' + usedID;

    var Finish = function() {
        user_showFields();
        misc_RemoveLoader();
        misc_SchedulePageSave();
    };

    var onSuccess = function(snapshot) {
        var temp_info = "";

        $("#name").text(snapshot.val().name);
        $("#email").text(snapshot.val().email);
        
        (snapshot.val().phone_ddd !== undefined)    ? temp_info = snapshot.val().phone_ddd : temp_info = "";
        (snapshot.val().phone_number !== undefined) ? temp_info += " " + snapshot.val().phone_number : temp_info;
        $("#phone_with_ddd").text(temp_info);

        (snapshot.val().publicplace !== undefined)  ? temp_info = snapshot.val().publicplace : temp_info = "";
        (snapshot.val().house_number !== undefined) ? temp_info += " " + snapshot.val().house_number : temp_info;
        $("#publicplace_with_number").text(temp_info);

        (snapshot.val().complement !== undefined)   ? temp_info = snapshot.val().complement : temp_info = "";
        (snapshot.val().district !== undefined)     ? temp_info += " " + snapshot.val().district : temp_info;
        $("#complement_district").text(temp_info);

        (snapshot.val().cep !== undefined)   ? temp_info = " " + snapshot.val().cep : temp_info = "";
        (snapshot.val().city !== undefined)  ? temp_info += " " + snapshot.val().city : temp_info;
        (snapshot.val().state !== undefined) ? temp_info += " - " + snapshot.val().state : temp_info;
        $("#cep_city_state").text(temp_info);

        if (snapshot.val().profile_picture_link !== undefined) {
            misc_SetImageRotation($('#imageuploaded'), snapshot.val().pictureRotate);
            misc_waitImageLoadReady($('#imageuploaded'), snapshot.val().profile_picture_link, function(){
                Finish();
            });
        } else {
            Finish();
        }
    };

    var onNullValue = function(snapshot) {
        user_showFields();
        misc_RemoveLoader();
    };

    var onError = function(snapshot) {
        user_showFields();
        misc_RemoveLoader();
    };

    db_get(path, onSuccess, onNullValue, onError);
};

const db_updateUserInfo = function() {
    var path = '/users/' + localStorage.getItem('auth_UserUID');
    
    //Form fields
    var name = document.getElementById('name').value;
    //var email = document.getElementById('email').value;
    var phone_ddd = document.getElementById('phone_ddd').value;
    var phone_number = document.getElementById('phone_number').value;
    var cep = document.getElementById('cep').value;

    var publicplace = document.getElementById('publicplace').value;
    var house_number = document.getElementById('house_number').value;
    var district = document.getElementById('district').value;

    var complement = document.getElementById('complement').value;
    var city = document.getElementById('city').innerText;
    var state = document.getElementById('state').innerText;
    var pictureRotate = misc_GetImageRotation($('#imageuploaded')).deg;
    
    var dataToInsert = {
        name: name,
        //email: email,
        phone_ddd: phone_ddd,
        phone_number: phone_number,
        cep: cep,
        publicplace: publicplace,
        house_number: house_number,
        district: district,
        complement: complement,
        city: city,
        state: state,
        pictureRotate: pictureRotate
    };
    
    db_update(path, dataToInsert, misc_GoToPage("user_info.html"));
};


const db_updateUserImage = function(url){
    var path = '/users/' + localStorage.getItem('auth_UserUID');

    var dataToInsert = {
        profile_picture_link: url,
        pictureRotate: 0
    }

    const doneSuccess = function(url){
        /*misc_waitImageLoadReady($('#imageuploaded'), url, function() {
            //$('#user_image').dimmer('hide');
            ad_Register_RemoveLoadingIconFromImage($('#fileInput'));
        });*/
        ad_Register_RemoveLoadingIconFromImage($('#fileInput'));
        db_updateUserInfo();
    }

    db_update(path, dataToInsert, doneSuccess(url));
}

const db_saveKmlInfoToAd = function(url){
    return new Promise((resolve) => {
        const path = "/ads_kmlfile/" + localStorage.getItem('adUID');
        var file = document.getElementById('findkmlfile').files[0];

        var dataToSave = {
            name : file.name,
            url : url
        };

        const commonAction = function(){
            localStorage.removeItem('adUID');
            resolve("doneSuccess on update ADS REG");
        };

        const onNull = function(){
            db_set(path, dataToSave,commonAction());            
        };

        const onSuccess = function(snapshot){
            var urlFromDb = snapshot.val();
            db_update(path, dataToSave, commonAction());    
        };
        db_get(path + "/url", onSuccess, onNull, onNull);
    });
}


/*
Params: Function to update files to storage
path: storage path from root on e.g. users_image/
file: array from input type=file e.g. document.getElementById('fileInput').files[0];
callback: function to be executed when uploaded is success to get url of uploaded file
*/
const db_SaveFileToStorage = function(path, file) {
    return new Promise((resolve) => {
        //This function add imagens on data base
        const name = path;
        const metadata = {
            contentType: file.type
        };
        var urlSaved = "";

        // Create a storage ref
        var storageRef = db_storage.ref(name);
        // Upload file
        var task = storageRef.put(file, metadata);

        // Update progress bar
        task.on('state_changed',
            function progress(snapshot) {
                var perc = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            function error(err) {
                misc_DisplayErrorMessage("Upload imagem","Image Upload Error: " + err);
            },
            function complete() {  
                 // Upload completed successfully, now we can get the download URL
                task.snapshot.ref.getDownloadURL().then((url) => {
                    console.log("could save to Storage and getDownloadURL");
                    resolve(url);
                });
            }
        );            
    });
}

const db_saveUserImage = async function(){
    var image_path = 'users_images/' + localStorage.getItem('auth_UserUID');

    var file = document.getElementById('fileInput').files[0];

    if (file) {
        ad_Register_SetImageLoading($('#fileInput'));
        let sUrl = await db_SaveFileToStorage(image_path, file);
        let sWaitSave = await db_updateUserImage(sUrl);
    } else {
        let sWaitSave = await db_updateUserInfo();
    }
}


const db_saveKmlFile = async function(adUID){
    var file_path = 'farm_kml/' + adUID;
    var file = document.getElementById('findkmlfile').files[0];

    localStorage.setItem('adUID', adUID);

    if (file) {
        let sUrl = await db_SaveFileToStorage(file_path, file);
        let sWaitSave = await db_saveKmlInfoToAd(sUrl);
        return new Promise ((resolve) => {
            resolve(sWaitSave);
        });
    }
}