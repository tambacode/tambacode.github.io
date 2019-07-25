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
};

var db_InsertAdRegistrationOnUsers = function(key){
    var path = 'users/' + localStorage.getItem('auth_UserUID') + '/ad/' + key;
    db_set(path, key);
};
///////////////////////////////// AD REG /////////////////////////////////