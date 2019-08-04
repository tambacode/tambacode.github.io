var db = firebase.database();
var db_storage = firebase.storage()
var rootRef = db.ref();
var rootStorageRef = db_storage.ref();

//  Use to get a new key when inserting a new data on DB
//  path (string): 'SharedFarm/Users'
var db_GetNewPushKey = function(path) {
    var key = db.ref().child(path).push().key;
    return key;
};

/*
    Method used to insert a new value in some path
    path (string): 'SharedFarm/Users'
    postData (Json structure): 
        var dataToInsert = {
            name: 'John',
            age : 26
        };
*/

var db_set = function(path, postData) {
    db.ref(path).set(postData);
};

//https://firebase.google.com/docs/database/web/read-and-write
var db_update = function(path, postData, callback) {
    db.ref(path).update(postData,
        function (error){
            if (error === null)
                callback;
            else
                misc_DisplayErrorMessage("Cadastro","Cadastro não foi realizado");// Data saved successfully!
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

var db_getOrderByChild = function(path, orderByChild, onSucess, onNullValue, onError) {
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

var db_getOrderByChildLimitToLast = function(path, orderByChild, limitToLast, onSucess, onNullValue, onError) {
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

var db_getOrderByChildContainsLimitToLast = function(path, orderByChild, containsString, limitToLast, onSucess, onNullValue, onError) {
    //.endAt(endAt + "\uf8ff")
    db.ref(path).orderByChild(orderByChild)
                .startAt(containsString)
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

var db_getInnerJoin = function(table1, pathInTableOne, table2, onSucess, onNullValue, onError) {
    table1.child(pathInTableOne).on('child_added', snap => {
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

///////////////////////////////// USERS /////////////////////////////////
var db_InsertUserOnLogin = function(path, name, providerName, providerToken) {
    var dataToInsert = {
        name: name,
        tokens : {}
    };

    dataToInsert.tokens[providerName] = providerToken;

    db_set(path, dataToInsert);
};

var db_getUserToEdit = function() {
    var path = '/users/' + localStorage.getItem('auth_UserUID');

    var onSuccess = function(snapshot) {
        $.each(snapshot.val(), function(field, value ) {
            if (field === "state")
                $('#' + field).dropdown('set selected', value);
            else if (field === "profile_picture_link" ) {
                if (value !== undefined) {
                    $('#imageuploaded')
                        .attr('src', value);
                    $('#imagebackgrounded')
                        .attr('style','background-image: url("' + value +'"); background-size: auto, cover;');
                }
            }
            else
                $('#' + field).val(value);
        });
        misc_RemoveLoader();
        user_showFields();
    };

    var onNullValue = function(snapshot) {
    };

    var onError = function(snapshot) {
    };

    db_get(path, onSuccess, onNullValue, onError);
};

var db_getUserInfo = function() {
    var path = '/users/' + localStorage.getItem('auth_UserUID');

    var onSuccess = function(snapshot) {
        $("#name").text(snapshot.val().name);
        $("#email").text(snapshot.val().email);
        if (snapshot.val().phone_ddd !== undefined && snapshot.val().phone_number !== undefined)
            $("#phone_with_ddd").text("(" + snapshot.val().phone_ddd + ") " + snapshot.val().phone_number);
        if (snapshot.val().city !== undefined && snapshot.val().state !== undefined)
            $("#city_state").text(snapshot.val().city + " - " + snapshot.val().state);
        
        if (snapshot.val().profile_picture_link !== undefined) {
            $('#imageuploaded')
                .attr('src', snapshot.val().profile_picture_link);
            $('#imagebackgrounded')
                .attr('style','background-image: url("' + snapshot.val().profile_picture_link +'"); background-size: auto, cover;');
        }
        misc_RemoveLoader();
        user_showFields();
    };

    var onNullValue = function(snapshot) {
    };

    var onError = function(snapshot) {
    };

    db_get(path, onSuccess, onNullValue, onError);
};

var db_updateUserInfo = function() {
    var path = '/users/' + localStorage.getItem('auth_UserUID');
    
    //Form fields
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var phone_ddd = document.getElementById('phone_ddd').value;
    var phone_number = document.getElementById('phone_number').value;
    var cep = document.getElementById('cep').value;

    var publicplace = document.getElementById('publicplace').value;
    var house_number = document.getElementById('house_number').value;
    var district = document.getElementById('district').value;

    var complement = document.getElementById('complement').value;
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    
    var dataToInsert = {
        name: name,
        email: email,
        phone_ddd: phone_ddd,
        phone_number: phone_number,
        cep: cep,
        publicplace: publicplace,
        house_number: house_number,
        district: district,
        complement: complement,
        city: city,
        state: state
    };
    
    db_update(path,dataToInsert,misc_GoToPage("user_info.html"));

};

const db_updateUserImage = function(url){
    var path = '/users/' + localStorage.getItem('auth_UserUID');

    const dummy = function(){
        console.log("uploaded");
    }

    var dataToInsert = {    
        profile_picture_link: url
    }

    db_update(path,dataToInsert,dummy);
}

/*
Params: Function to update files to storage
path: storage path from root on e.g. users_image/
file: array from input type=file e.g. document.getElementById('fileInput').files[0];
callback: function to be executed when uploaded is success to get url of uploaded file
*/
const db_saveImage = function(path, file, callback) {
    //This function add imagens on data base
    const name = path + "_" + file.name;
    const metadata = {
        contentType: file.type
    };

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
            task.snapshot.ref.getDownloadURL().then(callback);
        }
    );
}

const db_saveUserImage = function(){
    var image_path = 'users_images/' + localStorage.getItem('auth_UserUID');

    var file = document.getElementById('fileInput').files[0];

    db_saveImage(image_path, file, db_updateUserImage);
}

///////////////////////////////// EXAMPLES /////////////////////////////////
//  Below there are one (1) method to examplify how to use the methods above
var insertData = function(userId, name, notificationKey) {
    var path = 'data/' + userId + '/customerData';
    var postData = {
        name: name,
        notificationKey: notificationKey
    };

    db_set(path, postData);
};
////////////////////////////// END OF EXAMPLES /////////////////////////////