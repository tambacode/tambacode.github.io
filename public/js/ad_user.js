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

//Clean fields when load document
let addressFieldsClear = function(){
  $('form.ad_user')
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
        $("#publicplace").val(data.logradouro);
        $("#district").val(data.bairro);
        $("#city").val(data.cidade);
        $("#state").val(data.estado);
    });
    if(ceperror){
      cepViacep(cep).done(data => {
        $("#publicplace").val(data.logradouro);
        $("#district").val(data.bairro);
        $("#city").val(data.localidade);
        $("#state").val(data.uf);
      });
    }
  } else addressFieldsClear();
}

$(document)
  .ready(function() {
    $('#cep')
    	.blur(function(){
      	searchCep(this);
    });
    $('form.ad_user')
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
          phone: {
            identifier: 'phone',
            rules: [{
              type: 'regExp[/^[0-9]{11}$/gm]',
              prompt: 'O telefone não confere com o padrão'
            }]
          },
          cep: {
            identifier: '',
            rules: [{
              type: 'regExp[/^[0-9]{8}$/gm]',
              prompt: 'Preencha seu CEP'
            }]
          },
          terms: {
            identifier: 'terms',
            rules: [{
              type: 'checked',
              prompt: 'Aceite os termos'
            }]
          }
        }
    });
    db_getUserInfo();
  })
;