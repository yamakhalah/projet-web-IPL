$(document).ready(function() {

	$('#divConnexion').css('display', 'block');

    
    $('#butNotYetRegister').click(function() {
        toggleDiv('divInscription');
    });
    $('#butRegisterReturn').click(function() {
        toggleDiv('divConnexion');
    });
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