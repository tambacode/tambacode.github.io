var db = firebase.database();

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

/*
    Method used to update a value in some path
    path (string): 'SharedFarm/Users'
    postData (Json structure): 
        var dataToInsert = {
            name: 'John',
            age : 26
        };
*/
var db_update = function(path, postData) {
    var updates = {};
    updates[path] = postData;

    db.ref().update(updates)
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

///////////////////////////////// USERS /////////////////////////////////
var db_InsertUserOnLogin = function(path, name, providerName, providerToken) {
    var dataToInsert = {
        name: name,
        tokens : {}
    };

    dataToInsert.tokens[providerName] = providerToken;

    db_set(path, dataToInsert);
};
///////////////////////////////// USERS /////////////////////////////////

///////////////////////////////// EXAMPLES /////////////////////////////////
//  Below there are three (3) methods to examplify how to use the methods above
var insertData = function(userId, name, notificationKey) {
    var path = 'data/' + userId + '/customerData';
    var postData = {
        name: name,
        notificationKey: notificationKey
    };

    db_set(path, postData);
};

var insertRandomMessage = function(userId) {
    var name = 'Test Name - ' + Math.random();
    var text = 'Test MSG ' + Math.random();

    var postData = {
        id: userId,
        name: name,
        text : text
    };

    insertMessage(postData);
};

var insertMessage = function(postData) {
    var path = 'message/' + postData.id;
        path = path + '/' + db_GetNewPushKey(path);

    db_update(path, postData);
};
////////////////////////////// END OF EXAMPLES //////////////////////////////