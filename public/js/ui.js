var ui_openSidebar = function() {
    $('.ui.left.sidebar')
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('toggle')
};

/*
var ui_openFilterSidebar = function() {
    $('.ui.right.sidebar')
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('toggle')
};
*/

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