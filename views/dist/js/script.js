$(document).ready(function() {

    Init.all();

    $('#createButton').click(function () {
        toggleSectionManagement(1);
    })

    $('#manageButton').click(function () {
        toggleSectionManagement(3)
    })

    $('#validateNightButton').click(function () {
        toggleSectionManagement(2);
    });


    $('#addUserEmailButton').click(function () {
        var email = $('#section2emailInput').val()
        $('#sectionCreate2Form').append('<div id="exempleCheckboxX" class="checkbox">\n' +
            '<label><input type="checkbox" value="idInDBX" checked>'+email+'</label>\n' +
            '</div>')
    })



    $('#addGameButton').click(function () {
        $('#addGameButton').before('<div class="input-group" style="margin-bottom: 20px">' +
            '<select id="jsGameX" class="form-control">\n' +
            '<option>A IMPLEMENTER EN JS</option>\n' +
            '</select>' +
            '</div>')
    })


    $('#navJeux').click(function() {
        $('#section-jeux').attr('style', 'display:block');
    })


});

var User = (function() {
    function logIn() {
        Utils.notifySucces("Connexion réussie");
        Init.navUser();
    }    

    function logOut() {

    }

    function register() {

    }
    return {
        logIn: logIn,
        logOut: logOut,
        register: register
    }       
})();


function toggleSectionManagement(type) {
    if(type === 1){
        $('#sectionCreate2').attr('style','display:none');
        $('#sectionManage').attr('style','display:none');
        $('#sectionCreate1').attr('style', 'display:block');
        $('#sectionCreateJeux').attr('style', 'display:block');
    }else if(type === 2){
        $('#sectionCreate1').attr('style','display:none');
        $('#sectionCreateJeux').attr('style','display:none');
        $('#sectionCreate2').attr('style', 'display:block');
    }else if(type === 3) {
        $('#sectionCreate2').attr('style','display:none');
        $('#sectionCreate1').attr('style','display:none');
        $('#sectionCreateJeux').attr('style','display:none');
        $('#sectionManage').attr('style', 'display:block');
    }

}

// Visual + Click event
var Init = (function() {
    
    function all() {
        $('#divConnexion').css('display', 'block');
        $('#butNotYetRegister').click(function() {
            Utils.toggleDiv('divInscription');
        });
        $('#butRegisterReturn').click(function() {
            Utils.toggleDiv('divConnexion');
        });
        $('#butLogIn').click(function() {
            User.logIn();
        });
        
        initClickEvents();
    }
    
    function initClickEvents() {
        initNav();
        //initButtonForm();
    }

    // When the user log in
    function navUser() {
        $('#divConnexion').attr('style','display:none');
        $('#divNavBar').attr('style','display:block');
        $('#divInvitations').attr('style','display:block');
    }

    function initNav() {
        $('#navbar li a').each(function(index, element) {
            if (element.id === "disconnection") {
                // TODO traitement déconnexion
            } else {
                $(element).click(function() {
                    var idDiv = "div" + element.id.substring(7);
                    Utils.toggleDiv(idDiv);
                    Utils.activeNavItem($(element).parent().attr('id'));
                })
            }
        })
    }

    function initButtonForm() {

    }

    return {
        all: all,
        initClickEvents: initClickEvents,
        navUser: navUser
    }

})();


var Utils = (function() {

    function toggleDiv(divToDisplay) {
        var currentDisplay = getCurrentDisplaySection();
        $('#' + currentDisplay).attr('style', 'display:none');
        $('#' + divToDisplay).attr('style', 'display:block');
        $('#' + divToDisplay + " input:first").focus();
    }

    function activeNavItem(navItemToDisplay) {
        var currentActive = getCurrentActiveNavItem()
        $(currentActive).removeClass("active")
        $('#' + navItemToDisplay).addClass("active");
    }

    function getCurrentActiveNavItem() {
        var res;

        $("#navbar li").each(function () {
            if($(this).hasClass("active")) {
                res = $(this);
            }
        });
        return res;
    }

    function getCurrentDisplaySection() {
        var res;

        $("div[id^='div']").each(function() {
            if ($(this).css('display') == "block") {
                res = $(this).attr('id');
            }
        });
        return res;
    }

    function notifySucces(data) {
        $.notify({
            icon: 'fa fa-check-circle-o',
            title: '<b>Succès</b> : ',
            message: data
        },{
            type: 'success',
            allow_dismiss: true,
            placement: {
                from: "bottom",
                align: "right"
            },
            offset: {
                x: 20,
                y: 40
            },
            spacing: 10,
            z_index: 1031,
            delay: 5000,
        });
    }

    function notifyError(data) {
        $.notify({
            icon: 'fa fa-times-circle-o',
            title: '<b>ERREUR</b> : ',
            message: data
        },{
            type: 'danger',
            allow_dismiss: true,
            placement: {
                from: "bottom",
                align: "right"
            },
            offset: {
                x: 20,
                y: 40
            },
            spacing: 10,
            z_index: 1031,
            delay: 5000,
        });
    }

    return {
        toggleDiv: toggleDiv,
        activeNavItem: activeNavItem,
        notifySucces: notifySucces,
        notifyError: notifyError
    }
})();
