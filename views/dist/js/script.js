var connected = false;
var gamesTable;

$(document).ready(function() {
    Init.all();

    $.ajax({
        url: "/isAuthenicated",
        type: "get",
        success: function(data, status, jqXHR) {
            connected = true;
            Init.navUser();
        }, error: function(jqXHR, status, err) {
            $("#divConnexion").show();
        }
    });

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

    $('#addNightGameButton').click(function () {
        $('#addNightGameButton').before('<div class="input-group" style="margin-bottom: 20px">' +
            '<select id="jsGameX" class="form-control">\n' +
            '<option>A IMPLEMENTER EN JS</option>\n' +
            '</select>' +
            '</div>')
    })



    $('#navJeux').click(function() {
        $('#section-jeux').attr('style', 'display:block');
    })

    for(var i=0; i<24;i++){
        for(var j=0; j<60; j+5){
            var option = i+'H'+j;
            $('#jsHourBegin').append('<option>'+option+'</option>')
            $('#jsHourEnd').append('<option>'+option+'</option>')
        }
    }

    gamesHandler();
    gameNightHandler();
});

// Add here the methods and events that should happen after the user is connected
var functionsAfterConnection = function() {

}

var gameNightHandler = function() {
    $(".clockpicker").clockpicker({
        autoclose: 'true',
        align: "left"
    });

    // List of games to add to games-night
    var playableGamesColumns = [
            {"data": null, "visible": true, "orderable": false},
            {"data": "name", "visible": true, "searchable": true},
            {"data": null, "visible": true, "searchable": true}
        ];
    var playableGamesColumnDefs = [
            {
                "render": function ( data, type, row ) {
                    return "<input type='checkbox' id='" + data._id + "'/>";
                },
                "targets": 0
            },
            {
                "render": function (data, type, row) {
                    return data.minPlayers + " / " + data.maxPlayers
                },
                "targets": 2
            }
        ]
    initDatatable("playable-games-table", "/games", playableGamesColumns, playableGamesColumnDefs);

    // List of possible guests
    var guestTableColumns = [
            {"data": null, "visible": true, "orderable": false},
            {"data": "firstname", "visible": true, "searchable": true},
            {"data": "lastname", "visible": true, "searchable": true}
        ];
    var guestTableColumnDefs = [
            {
                "render": function ( data, type, row ) {
                    return "<input type='checkbox' id='" + data._id + "'/>";
                },
                "targets": 0
            }
        ]
    initDatatable("invite-guests-table", "/users", guestTableColumns, guestTableColumnDefs);
}

var User = (function() {
    function logIn() {
        $.ajax({
            url: "/login",
            type: "post",
            data: formToJson("formLogin"),
            success: function(data, status, jqXHR) {
                Utils.notifySucces("Connexion réussie");
                connected = true;
                Init.navUser();
            }, error: function(jqXHR, status, err) {
                Utils.notifyError(status);
            }
        }).done(function() {
            functionsAfterConnection();
        })
    }

    function logOut() {
        $.ajax({
            url: "/logout",
            type: "get",
            success: function(data, status, jqXHR) {
                connected = false;
                location.reload();
            }, error: function(jqXHR, status, err) {
                Utils.notifyError("Une erreur s'est produite: " + err);
            }
        })
    }

    function register() {
        $.ajax({
            url: "/signup",
            type: "post",
            data: formToJson("formInscription"),
            success: function(data, status, jqXHR) {
                Utils.notifySucces("Vous pouvez dès a présent vous connecter");
                setTimeout(function() {
                    location.reload();
                }, 1000);
            }, error: function(jqXHR, status, err) {
                Utils.notifyError("Une erreur s'est produite: " + err);
            }
        })
    }
    return {
        logIn: logIn,
        logOut: logOut,
        register: register
    }       
})();

//////////////////////////////////////////////////////
///////////////// GAMES //////////////////////////////
//////////////////////////////////////////////////////
var gamesHandler = function() {
    // Add a game
    $("#addGameButton").on('click', function(e) {
        e.preventDefault();
        $.ajax({
            url: "/game",
            type: "post",
            data: formToJson("addGameForm"),
            success: function(data, status, jqXHR) {
                Utils.notifySucces("Jeu ajouté avec succès");
                gamesTable.ajax.url("/games").load();
            }, error: function(jqXHR, status, err) {
                Utils.notifyError(status);
            }
        })
    })

    // List all games
    var gamesColumns = [
            {"data": "image", "visible": true, "orderable": false},
            {"data": "name", "visible": true, "searchable": true},
            {"data": null, "visible": true, "searchable": true},
            {"data": null, "visible": true, "searchable": false},
            {"data": null, "visible": true, "orderable": false}
        ];
    var gamesColumnDefs = [
            {
                "render": function ( data, type, row ) {
                    if (data.description) {
                        return data.description;
                    }
                    return "";
                },
                "targets": 2
            },
            {
                "render": function ( data, type, row ) {
                    return data.minPlayers + ' / ' + data.maxPlayers;
                },
                "targets": 3
            },
            {
                "render": function ( data, type, row ) {
                    return '<button type="button" class="btn btn-default btn-sm"><i class="fa fa-trash"></i></button>';
                },
                "targets": 4
            }
        ];
    gamesTable = initDatatable("gamesTable", "/games", gamesColumns, gamesColumnDefs);
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

// Visual + Click event
var Init = (function() {
    
    function all() {
        $('#butNotYetRegister').click(function() {
            Utils.toggleDiv('divInscription');
        });
        $('#butRegisterReturn').click(function() {
            Utils.toggleDiv('divConnexion');
        });
        $('#butLogIn').click(function() {
            User.logIn();
        });
        $("#butRegister").click(function() {
            User.register();
        });
        $("#disconnection").click(function() {
            User.logOut();
        })
        
        initClickEvents();
    }
    
    function initClickEvents() {
        initNav();
        //initButtonForm();
    }

    // When the user log in
    function navUser() {
        if (connected) {
            $('#divConnexion').attr('style','display:none');
            $('#divNavBar').attr('style','display:block');
            $('#divInvitations').attr('style','display:block');
        }
    }

    function initNav() {
        $('#navbar li a').each(function(index, element) {
            if (element.id === "disconnection") {
                
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

var formToJson = function(selector) {
    var data = {};

    $("#" + selector).find('input').each(function() {
        data[$(this).attr('name')] = $(this).val();
    });
    $("#" + selector).find('textarea').each(function() {
        data[$(this).attr('name')] = $(this).val();
    });
    return data;
}

var initDatatable = function(tableId, route, columns, columnDefs) {
    return $("#" + tableId).on("xhr.dt", function(e, settings, data) {
    })
    .DataTable({
        ajax: {
            url: route,
        },
        rowId: "_id",
        language: {
            processing: "Chargement des données ...",
            emptyTable: "Aucun utilisateur enregistré...",
            lengthMenu: "Afficher _MENU_ entrées",
            sInfo: "Affiche _START_ à _END_ de _TOTAL_ entrées",
            paginate: {
                next:       "Suivant",
                previous:   "Précédent"
            },
            search: "Recherche:"
        },
        stateSave: true,
        columns: columns,
        columnDefs: columnDefs
    });
}
