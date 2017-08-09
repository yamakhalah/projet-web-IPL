$(document).ready(function() {

	$('#divConnexion').css('display', 'block');

    
    $('#butNotYetRegister').click(function() {
        toggleDiv('divInscription');
    });
    $('#butRegisterReturn').click(function() {
        toggleDiv('divConnexion');
    });
    $('#createButton').click(function () {
        toggleSectionManagement(1);
    })

    $('#manageButton').click(function () {
        toggleSectionManagement(3)
    })

    $('#validateNightButton').click(function () {
        toggleSectionManagement(2);
    })

    $('#displayGames').click(function () {
        toggleDiv('divGames');
    })

    $('#displayInvitations').click(function () {
        toggleDiv('divInvitations');
    })

    $('#displayManagement').click(function () {
        toggleDiv('divManagement');
    })

    $('#displayNight').click(function () {

    })




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
});


function toggleDiv(divToDisplay) {
    var currentDisplay = getCurrentDisplaySection();
    $('#' + currentDisplay).attr('style', 'display:none');
    $('#' + divToDisplay).attr('style', 'display:block');
    $('#' + divToDisplay + " input:first").focus();
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


