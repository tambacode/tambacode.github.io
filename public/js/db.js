var db = firebase.database();
var rootRef = db.ref();

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

var db_update = function(path, postData) {
    db.ref(path).update(postData);
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

var db_getUserInfo = function() {
    var path = '/users/' + localStorage.getItem('auth_UserUID');

    var onSuccess = function(snapshot) {
        
        $.each(snapshot.val(), function(field, value ) {
            document.getElementById(field).value = value;
        });
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
    var phone = document.getElementById('phone').value;
    var cep = document.getElementById('cep').value;

    var publicplace = document.getElementById('publicplace').value;
    var number = document.getElementById('number').value;
    var district = document.getElementById('district').value;

    var complement = document.getElementById('complement').value;
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;

    var terms = "true";
    
    var dataToInsert = {
        name: name,
        email: email,
        phone: phone,
        cep: cep,
        publicplace: publicplace,
        number: number,
        district: district,
        complement: complement,
        city: city,
        state: state,
        terms: terms
    };

    db_update(path,dataToInsert);
};

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
////////////////////////////// END OF EXAMPLES //////////////////////////////