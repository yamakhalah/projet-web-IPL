$(document).ready(function() {

	$('#divConnexion').css('display', 'block');

    
    $('#butNotYetRegister').click(function() {
        toggleDiv('divInscription');
    });
    $('#butRegisterReturn').click(function() {
        toggleDiv('divConnexion');
    });
    $('#createButton').click(function () {
        toggleDiv('divManagement')
    })

    $('#displayGames').click(function () {

    })

    $('#displayInvitations').click(function () {
        toggleDiv('divInvitations')
    })

    $('#displayManagement').click(function () {
        toggleDiv('divManagement')
    })

    $('#displayNight').click(function () {

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

function getCurrentDisplayUnderSection(currentDiv, divToDisplay){
    $("currentDiv div[id^='section']").each(function() {
        if ($(this).css('display') == "block") {
            res = $(this).attr('id');
        }
    });
    return res;
}

