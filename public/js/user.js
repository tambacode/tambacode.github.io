const getStates = function(){
  var states_list = ["AC","AL","AM","AP","BA",
                     "CE","DF","ES","GO","MA",
                     "MG","MS","MT","PA","PB",
                     "PE","PI","PR","RJ","RN",
                     "RO","RR","RS","SC","SE",
                     "SP","TO"];
  $.each(states_list, function (i, sigla) {
    $("#state").append(new Option(sigla, sigla));
  });
}

//Search in webservice viacep.com.br
const cepViacep = function(cep){
  var urlcep = "https://viacep.com.br/ws/"+ cep +"/json/";
  return $.getJSON(urlcep, addressFieldsClear());
}

//Search in webservice api.postmon.com.br
const cepPostmon = function(cep){
    var urlcep = "https://api.postmon.com.br/v1/cep/" + cep;
    return $.getJSON(urlcep, addressFieldsClear());
}

const showUserFields = function(){
  $("#display_user_edit").show();//removeAttr("style");
}

//Clean fields when load document
const addressFieldsClear = function(){
  $('form.user_edit')
  	.form('set values', {
      publicplace : '',
      district : '',
      city: '',
      state: ''
    });
}
//Clean fields when load document
const stateCityFieldsClear = function(){
  $('form.user_edit')
    .form('set values', {
      city: '',
      state: ''
    });
}

//Search CEP in two sources, if did not find let as it is
const searchCep = function(object){
  
  var ceperror = 1;
  
  var cep = $(object).val().replace(/\D/g, ''); //Let only numbers in "cep"
  var validacep = /^[0-9]{8}$/;                 //Regular expression to validate CEP.

  if (cep != "" && validacep.test(cep)) {
    cepPostmon(cep).done(data => {
        ceperror = 0;
        $("#publicplace").val(data.logradouro);
        $("#district").val(data.bairro);
        $("#city").val(data.cidade);
        $("#state").dropdown('set selected', data.uf);
    });
    if(ceperror){
      cepViacep(cep).done(data => {
        $("#publicplace").val(data.logradouro);
        $("#district").val(data.bairro);
        $("#city").val(data.localidade);
        $("#state").dropdown('set selected', data.uf);
      });
    }
  } else addressFieldsClear();
}

const initComponent = function(){
  $('#state').dropdown();
  getStates();
  $('#cep')
    .blur(function(){ searchCep(this); })
    .mask("00000-000");
  $('#phone_number').mask('00000-0000');
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
            type: 'regExp[/^[0-9]{2}$/gm]',
            prompt: 'O DDD não confere com o padrão 99'
          }]
        },
        phone_number: {
          identifier: 'phone_number',
          rules: [{
            type: 'regExp[/^[0-9]{5}-[0-9]{4}$/gm]',
            prompt: 'O telefone não confere com o padrão 99999-8888'
          }]
        },
        cep: {
          identifier: '',
          rules: [{
            type: 'regExp[/^[0-9]{5}-[0-9]{3}$/gm]',
            prompt: 'Preencha seu CEP no formato 99999-000'
          }]
        }
      }, onSuccess: function(event){
                        event.preventDefault();
                        db_updateUserInfo();
                    }
    });
}