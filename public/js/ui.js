var ui_openSidebar = function() {
    $('.ui.left.sidebar')
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('toggle')
};

var ui_openFilterSidebar = function() {
    $('.ui.right.sidebar')
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('toggle')
};

const ad_InitDropDownWithStates = function(dropDownField) {
    dropDownField.dropdown({
        values: [
          { name : 'Acre', value : 'AC', selected: true },
          { name : 'Alagoas', value : 'AL' },
          { name : 'Amapá', value : 'AP' },
          { name : 'Amazonas', value : 'AM' },
          { name : 'Bahia', value : 'BA' },
          { name : 'Ceará', value : 'CE' },
          { name : 'Distrito Federal', value : 'DF' },
          { name : 'Espírito Santo', value : 'ES' },
          { name : 'Goiás', value : 'GO' },
          { name : 'Maranhão', value : 'MA' },
          { name : 'Mato Grosso', value : 'MT' },
          { name : 'Minas Gerais', value : 'MG' },
          { name : 'Mato Grosso do Sul', value : 'MS' },
          { name : 'Minas Gerais', value : 'MG' },
          { name : 'Pará', value : 'PA' },
          { name : 'Paraíba', value : 'PB' },
          { name : 'Paraná', value : 'PR' },
          { name : 'Pernambuco', value : 'PE' },
          { name : 'Piauí', value : 'PI' },
          { name : 'Rio de Janeiro', value : 'RJ' },
          { name : 'Rio Grande do Norte', value : 'RN' },
          { name : 'Rio Grande do Sul', value : 'RS' },
          { name : 'Rondônia', value : 'RO' },
          { name : 'Roraima', value : 'RR' },
          { name : 'Santa Catarina', value : 'SC' },
          { name : 'São Paulo', value : 'SP' },
          { name : 'Sergipe', value : 'SE' },
          { name : 'Tocantins', value : 'TO' }
        ]
      });
};

var ui_headerRightAction = function(){

	var ui_rightIcon = "<button class='ui icon button orange' onclick='{0}'> \
                    		<i class='icon {1} large'></i> \
                    	</button>";

    if (localStorage.getItem('auth_UserOnline')) {
        ui_rightIcon = ui_rightIcon.replace('{0}', 'user_OpenProfile();');
        ui_rightIcon = ui_rightIcon.replace('{1}', 'user circle');
        //ui_rightIcon = ui_rightIcon.replace('{0}', 'ui_openFilterSidebar();');
        //ui_rightIcon = ui_rightIcon.replace('{1}', 'filter');
    } else {
        ui_rightIcon = ui_rightIcon.replace('{0}', 'misc_GoToHome();');
        ui_rightIcon = ui_rightIcon.replace('{1}', 'sign-in');
    }

	$('#header_right').append(ui_rightIcon);
}