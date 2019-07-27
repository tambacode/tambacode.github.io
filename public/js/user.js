//Search in webservice viacep.com.br
let cepViacep = function(cep){
  var urlcep = "https://viacep.com.br/ws/"+ cep +"/json/";
  return $.getJSON(urlcep, addressFieldsClear());
}

//Search in webservice api.postmon.com.br
let cepPostmon = function(cep){
    var urlcep = "https://api.postmon.com.br/v1/cep/" + cep;
    return $.getJSON(urlcep, addressFieldsClear());
}

let showUserFields = function(){
  $("#display_user_edit").show();//removeAttr("style");
}

//Clean fields when load document
let addressFieldsClear = function(){
  $('form.user_edit')
  	.form('set values', {
      publicplace : '',
      district : '',
      city: '',
      state: ''
    });
}

//Search CEP in two sources, if did not find let as it is
let searchCep = function(object){
  
  var ceperror = 1;
  
  var cep = $(object).val().replace(/\D/g, ''); //Let only numbers in "cep"
  var validacep = /^[0-9]{8}$/;                 //Regular expression to validate CEP.

  if (cep != "" && validacep.test(cep)) {
    cepPostmon(cep).done(data => {
        ceperror = 0;
        $("form.user_edit#publicplace").val(data.logradouro).prop("disabled", true);
        $("form.user_edit#district").val(data.bairro).prop("disabled", true);
        $("form.user_edit#city").val(data.cidade);
        $("form.user_edit#state").val(data.estado);
    });
    if(ceperror){
      cepViacep(cep).done(data => {
        $("form.user_edit#publicplace").val(data.logradouro);
        $("form.user_edit#district").val(data.bairro);
        $("form.user_edit#city").val(data.localidade);
        $("form.user_edit#state").val(data.uf);
      });
    }
  } else addressFieldsClear();
}

let updateUserInfo = function(e){
  e.preventDefault();
  db_updateUserInfo();
}


$(document)
  .ready(function() {
    $('#cep')
    	.blur(function(){
      	searchCep(this);
    });
    $('form.user_edit')
      .form({
        fields: {
          name: {
            identifier: 'name',
            rules: [{
              type: 'empty',
              prompt: 'Preencha com seu nome completo'
            }]
          },
          email: {
            identifier: 'email',
            rules: [{
              type: 'email',
              prompt: 'Coloque um email válido'
            }]
          },
          phone_ddd: {
            identifier: 'phone_ddd',
            rules: [{
              type: 'regExp[/^[0-9]{3}$/gm]',
              prompt: 'O DDD não confere com o padrão XXX'
            }]
          },
          phone_number: {
            identifier: 'phone_number',
            rules: [{
              type: 'regExp[/^[0-9]{9}$/gm]',
              prompt: 'O telefone não confere com o padrão 999998888'
            }]
          },
          cep: {
            identifier: '',
            rules: [{
              type: 'regExp[/^[0-9]{8}$/gm]',
              prompt: 'Preencha seu CEP no formato 99999000'
            }]
          }
        }, onSuccess: function(event){ updateUserInfo(event) }
    });
  })
;