//Search in webservice viacep.com.br
const user_cepViacep = function(cep){
  var urlcep = "https://viacep.com.br/ws/"+ cep +"/json/";
  return $.getJSON(urlcep, user_addressFieldsClear());
}

//Search in webservice api.postmon.com.br
const user_cepPostmon = function(cep){
    var urlcep = "https://api.postmon.com.br/v1/cep/" + cep;
    return $.getJSON(urlcep, user_addressFieldsClear());
}

const user_showFields = function(){
  $("#display_user_edit").show();//removeAttr("style");
}

//Clean fields when load document
const user_addressFieldsClear = function(){
  $('form.user_edit')
  	.form('set values', {
      publicplace : '',
      district : '',
      city: '',
      state: ''
    });
}
//Clean fields when load document
const user_stateCityFieldsClear = function(){
  $('form.user_edit')
    .form('set values', {
      city: '',
      state: ''
    });
}

//Search CEP in two sources, if did not find let as it is
const user_searchCep = function(object){
  
  var ceperror = 1;
  
  var cep = $(object).val().replace(/\D/g, ''); //Let only numbers in "cep"
  var validacep = /^[0-9]{8}$/;                 //Regular expression to validate CEP.

  if (cep != "" && validacep.test(cep)) {
    user_cepPostmon(cep).done(data => {
        ceperror = 0;
        $("#publicplace").val(data.logradouro);
        $("#district").val(data.bairro);
        $("#state").dropdown('set selected', data.uf);
        setTimeout( function(){
          $("#city").dropdown('set selected', data.cidade);
        }, 2000);
    });
    if(ceperror){
      user_cepViacep(cep).done(data => {
        $("#publicplace").val(data.logradouro);
        $("#district").val(data.bairro);
        $("#state").dropdown('set selected', data.uf);
        setTimeout( function(){
            $("#city").dropdown('set selected', data.localidade);
        }, 2000);
      });
    }
  } else user_addressFieldsClear();
}

const user_openFileDialog = function(){
  $('#fileInput').click();
}

const user_previewImage = function(evt){
  if (evt.target.files[0].size > 5242880){
    misc_DisplayErrorMessage("Tamanho da imagem","Imagem maior de 5MB");
    return;
  }
  ad_Register_SetImageLoading($('#fileInput'));
  db_saveUserImage();
}

const user_initComponent = function(){
  //$('#state').dropdown();
  misc_InitDropdownWithStates($("#state"), $("#city"));
  $('#user_image').dimmer({ on: 'hover' });
  $('#fileInput').change(user_previewImage);
  $('#cep')
    .blur(function(){ user_searchCep(this); })
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
        /*email: {
          identifier: 'email',
          rules: [{
            type: 'email',
            prompt: 'Coloque um email válido'
          }]
        },*/
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
        } /*, Removed
        cep: {
          identifier: '',
          rules: [{
            type: 'regExp[/^[0-9]{5}-[0-9]{3}$/gm]',
            prompt: 'Preencha seu CEP no formato 99999-000'
          }]
        }*/
      }, onSuccess: function(event){
                        event.preventDefault();
                        db_updateUserInfo();
                    }
    });
}