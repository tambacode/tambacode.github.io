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

const ui_InitDropDownWithStates = function(dropDownField, adAny) {
    var values = [];

    if (adAny) {
        values.push({ name: 'Selecione', value: '', selected : true });
        values.push({ name : 'Acre', value : 'AC'});
    } else {
        values.push({ name : 'Acre', value : 'AC', selected: true });
    }

    values.push({ name : 'Alagoas', value : 'AL' });
    values.push({ name : 'Amapá', value : 'AP' });
    values.push({ name : 'Amazonas', value : 'AM' });
    values.push({ name : 'Bahia', value : 'BA' });
    values.push({ name : 'Ceará', value : 'CE' });
    values.push({ name : 'Distrito Federal', value : 'DF' });
    values.push({ name : 'Espírito Santo', value : 'ES' });
    values.push({ name : 'Goiás', value : 'GO' });
    values.push({ name : 'Maranhão', value : 'MA' });
    values.push({ name : 'Mato Grosso', value : 'MT' });
    values.push({ name : 'Minas Gerais', value : 'MG' });
    values.push({ name : 'Mato Grosso do Sul', value : 'MS' });
    values.push({ name : 'Minas Gerais', value : 'MG' });
    values.push({ name : 'Pará', value : 'PA' });
    values.push({ name : 'Paraíba', value : 'PB' });
    values.push({ name : 'Paraná', value : 'PR' });
    values.push({ name : 'Pernambuco', value : 'PE' });
    values.push({ name : 'Piauí', value : 'PI' });
    values.push({ name : 'Acre', value : 'AC' });
    values.push({ name : 'Rio de Janeiro', value : 'RJ' });
    values.push({ name : 'Rio Grande do Norte', value : 'RN' });
    values.push({ name : 'Rio Grande do Sul', value : 'RS' });
    values.push({ name : 'Rondônia', value : 'RO' });
    values.push({ name : 'Roraima', value : 'RR' });
    values.push({ name : 'Santa Catarina', value : 'SC' });
    values.push({ name : 'São Paulo', value : 'SP' });
    values.push({ name : 'Sergipe', value : 'SE' });
    values.push({ name : 'Tocantins', value : 'TO' });

    dropDownField.dropdown({ values: values });
};

var ui_headerRightAction = function(){

	var ui_rightIcon = "<button class='ui icon button green' onclick='{0}'> \
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