var connected = false;
var gamesTable;
var playableGamesTable;

$(document).ready(function() {
    Init.all();
    Init.navUser();

    // Check if the use is authenticated
    $.ajax({
        url: "/isAuthenticated",
        type: "get",
        success: function(data, status, jqXHR) {
            connected = true;
            Init.navUser();
        }, error: function(jqXHR, status, err) {
            $("#divConnexion").show();
        }
    }).done(function (){
        if (connected) {
            functionsAfterConnection();
        }
    });

    $('#createButton').click(function () {
        toggleSectionManagement(1);
        CheckInputForm.clearFormCreation();
    })

    $('#manageButton').click(function () {
        toggleSectionManagement(3);
    })

    $('#validateNightButton').click(function () {
    	var idPanel = $('div[class="tab-pane fade active in"]').attr('id');
        var newPanel = 0;
        
        switch(idPanel) {
            case "night1":
                if ($('#formCreation').valid()) {
                    newPanel = 2;
                }
                break;

            case "night2":
                var inputCheckTabGames = $("#playable-games-table").find("input:checked");
                if (inputCheckTabGames.length === 0) {
                    newPanel = 2;
                    Utils.notifyError("Veuillez sélectionner au moins un jeu !");
                    break;
                } else {
                    newPanel = 3;
                }
                break;

            case "night3":

                // Check all forms
                // 1
                if (! $('#formCreation').valid()) {
                    newPanel = 1;
                    Utils.notifyError("Veuillez corriger les erreurs indiquées !");
                    break;
                }
                // 2
                var inputTabGames = $("#playable-games-table").find("input:checked");
                if (inputTabGames.length === 0) {
                    newPanel = 2;
                    Utils.notifyError("Veuillez sélectionner au moins un jeu !");
                    break;
                }

                //3
                var inputCheckTabGuests = $("#invite-guests-table").find("input:checked");
                var countEmail = $('.inputInvitationEmail').length;
                if (inputCheckTabGuests.length === 0 && countEmail === 0) {
                    Utils.notifyError("Veuillez sélectionner au moins un user ou ajouter une adresse email !");
                    break;
                }


                // 1 - Send ajax email non-user

                var tabEmail = Array();
                var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
                $('.inputInvitationEmail').each(function() {
                    if (testEmail.test($(this).val())) {
                        tabEmail.push($(this).val());
                    }
                });

                // Contains non-user + user
                var guests = new Array();

                if (tabEmail.length != 0) {
                    $.ajax({
                        async: false,
                        url: "/users/addUsersByMail",
                        type: "post",
                        data: {tabEmails : tabEmail},
                        success: function(data, status, jqXHR) {
                            
                            Utils.notifySucces('Email envoyé');

                            for (var i = 0; i < data.userIds.length; i++) {
                                var guest = {
                                    id : data.userIds[i],
                                    isValidated : false
                                }
                                guests.push(guest);
                            }
                        }
                    });
                }
                
                // 2 - Create Night
                var night = formToJson('formCreation');
                var regex = new RegExp('^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$');
                if (regex.test(night['date'])){
                    var date = moment(night['date'], 'YYYY-MM-DD');
                } else {
                    var date = moment(night['date'], 'MM/DD/YYYY');
                }
                night['date'] = new Date(date.valueOf());
                night['startTime'] = new Date("Wed Jun 20 " + night['startTime'] + ":00 +0200 2017");
                night['endTime'] = new Date("Wed Jun 20 " + night['endTime'] + ":00 +0200 2017");
                night['status'] = "CREATED";

                // Fetch the games chosen for the night
                var games = new Array();
                for (var i=0; i < inputTabGames.length; i++) {
                    var game = {
                        id : $(inputTabGames[i]).attr('id'),
                        nbParticipants : 0,
                        isValidated : false
                    }
                    games.push(game);
                }
                
                // Fetch the guests to invite
                for (var j=0; j < inputCheckTabGuests.length; j++) {
                    var guest = {
                        id : $(inputCheckTabGuests[j]).attr('id'),
                        isValidated : false
                    }
                    guests.push(guest);
                }
                
                night['games'] = games;
                night['guests'] = guests;

                $.ajax({
                    url: "/night",
                    type: "post",
                    data: night,
                    success: function(data, status, jqXHR) {
                        if (! data.success) {
                            Utils.notifyError(data.message);
                        } else {
                            Utils.notifySucces("La soirée a bien été créée");
                        }
                    }, error: function(jqXHR, status, err) {
                        Utils.notifyError(status);
                    }
                });       
                break;
        }

    	if (newPanel !== 0) {
            $('div[class="tab-pane fade active in"]').removeClass("active in");
            $('a[href="#' + idPanel +'"]').parent().removeClass("active");
            $('#night' + newPanel).addClass("active in");
            $('a[href="#night' + newPanel + '"]').parent().addClass("active");

        }
    });


    $('#addUserEmailButton').click(function() {
        $('#addUserEmailButton').after("<div class='row pInvitationEmail' style='margin-top: 13px'><div class='col-lg-10'><div class='input-group'><span class='input-group-addon'><i class='fa fa-envelope'></i></span><input class='form-control inputInvitationEmail' placeholder='example@gmail.com' name='email' type='text' /></div></div><div class='col-lg-2'><button class='btn btn-danger btn-sm pull-right butDeleteRowEmail'><i class='fa fa-times-circle-o'></i></button></div></div>");
        
    });

    $(document).on('click', '.butDeleteRowEmail', function() {
        $(this).closest('.pInvitationEmail').remove();
    })

    $('#navJeux').click(function() {
        $('#section-jeux').attr('style', 'display:block');
    })

    $("#nights-panels").on('click', '.validate', function() {
        var panel = $(this).closest('.panel');
        var tr = $(this).closest('tr');

        $.ajax({
            url: "night/" + $(panel).attr('id') + "/confirm/" + $(tr).attr('id'),
            type: "post",
            success: function(data, status, jqXHR) {
                Utils.notifySucces("La soirée a bien été validée");
                setTimeout(function() {
                    location.reload();
                }, 1000);
            }, error() {

            }
        });
    })
});

// Add here the methods and events that should happen after the user is connected
var functionsAfterConnection = function() {
    gamesHandler();
    gameNightHandler();
    nightsIncomming();

    // List all the nights to which the connected user has been invited to
    $.ajax({
        url: "/user-nights",
        type: "get",
        success: function(data, status, jqXHR) {
            if (! data.success) {
                Utils.notifyError(data.message);
            } else {
                var nights = data.data;
                var i = 0;
                for (var night of nights) {
                    var clone = $("#toClone").clone();

                    $(clone).removeAttr('id');

                    var date = moment(night.date);
                    var startTime = moment(night.startTime);
                    var endTime = moment(night.endTime);

                    var toAdd = date.format("DD / MM / YYYY") + " : " + night.name + " de " + startTime.format("HH:mm") + " à " + endTime.format("HH:mm");
                    $(clone).find('.panel-heading').html("").append(toAdd);

                    $(clone).find('.panel').first().attr('id', night.id);

                    var j = 0;

                    $(clone).find('.panel-body tbody').first().html("");
                    for (var game of night.games) {
                        if (night.status !== "FINISHED") {
                            toAdd = "<tr id='" + game._id + "'><td>" + game.name + "</td>"
                            + "<td>" + game.minPlayers + "</td>"
                            + "<td>" + game.maxPlayers + "</td>"
                            + "<td>" + night.nbParticipants[j] + "</td>"
                            + "<td style='text-align: center;'><button type='button' class='btn btn-success validate'><i class='fa fa-check'></i> S'inscrire</button></td>"
                            + "</tr>";   
                        } else {
                            toAdd = "<tr id='" + game._id + "'><td>" + game.name + "</td>"
                            + "<td>" + game.minPlayers + "</td>"
                            + "<td>" + game.maxPlayers + "</td>"
                            + "<td>" + night.nbParticipants[j] + "</td>"
                            + "<td style='text-align: center;'>FINI</td>"
                            + "</tr>";
                        }
                        $(clone).find('.panel-body tbody').first().append(toAdd);

                        j++;
                    }
                    
                    $(clone).find('.panel-body table').first().attr('id', "invite-table-" + i);
                    
                    i++;

                    $(clone).removeAttr('hidden');
                    $("#invitations-panels").append(clone);
                }
                while (i >= 0) {
                    $("#invite-table-" + i).DataTable();
                    i--;
                }
            }
        }, error: function(jqXHR, status, err) {
            Utils.notifyError(status);
        }
    });

    $.ajax({
        url: "/nights/user",
        type: "get",
        success: function(data, status, jqXHR) {
            if (! data.success) {
                Utils.notifyError(data.message);
            } else {
                var nights = data.data;
                var i = 0;
                for (var night of nights) {
                    var clone = $("#toClone").clone();

                    $(clone).removeAttr('id');

                    var date = moment(night.date);
                    var startTime = moment(night.startTime);
                    var endTime = moment(night.endTime);

                    var toAdd = date.format("DD / MM / YYYY") + " : " + night.name + " de " + startTime.format("HH:mm") + " à " + endTime.format("HH:mm");
                    $(clone).find('.panel-heading').html("").append(toAdd);

                    $(clone).find('.panel').first().attr('id', night.id);

                    var j = 0;

                    $(clone).find('.panel-body tbody').first().html("");

                    for (var game of night.games) {
                        toAdd = "<tr id='" + game._id + "'><td>" + game.name + "</td>"
                            + "<td>" + game.minPlayers + "</td>"
                            + "<td>" + game.maxPlayers + "</td>"
                            + "<td>" + night.nbParticipants[j] + "</td>";
                        if (! game.validated) {
                            toAdd += "<td style='text-align: center;'><button type='button' class='btn btn-success validate'><i class='fa fa-check'></i> Valider</button></td>"
                        } else {
                            if (game.validateds[j]) {
                                toAdd += "<td style='text-align: center;'><button type='button' class='btn btn-success cancel'><i class='fa fa-check'></i> Annuler</button></td>"
                            }
                        }
                        + "</tr>"
                        $(clone).find('.panel-body tbody').first().append(toAdd);
                        j++;
                    }
                    
                    $(clone).find('.panel-body table').first().attr('id', "night-table-" + i);
                    
                    i++;

                    $(clone).removeAttr('hidden');
                    $("#nights-panels").append(clone);
                }
                while (i >= 0) {
                    $("#night-table-" + i).DataTable();
                    i--;
                }
            }
        }, error: function(jqXHR, status, err) {
            Utils.notifyError(status);
        }
    }); 

    $("#divInvitations").on('click', '.validate', function() {
        var panel = $(this).closest('.panel');
        var idNight = $(panel).attr('id');

        var tr = $(this).closest('tr');
        var idGame = $(tr).attr('id');

        $.ajax({
            url: "/night/" + idNight + "/addParticipant/" + idGame,
            type: "post",
            success: function(data, status, jqXHR) {
                Utils.notifySucces(data.message);
                setTimeout(function() {
                    location.reload();
                }, 1000);
            }, error: function(jqXHR, status, err) {
                notifyError(err);
            }
        });
    });

    var nightsColumns = [
            {"data": null, "visible": true, "orderable": false},
            {"data": null, "visible": true, "orderable": false},
            {"data": null, "visible": true, "orderable": false},
            {"data": null, "visible": true, "searchable": true},
            {"data": null, "visible": true},
            {"data": null, "visible": true},
            {"data": null, "visible": true}
        ];
    var nightsColumnDefs = [
            {
                "render": function ( data, type, row ) {
                    var date = moment(data.date)
                    return date.format("DD / MM / YYYY");
                },
                "targets": 0
            },
            {
                "render": function (data, type, row) {
                    var startTime = moment(data.startTime);
                    var endTime = moment(data.endTime);
                    return startTime.format("HH:mm") + " - " + endTime.format("HH:mm")
                },
                "targets": 1
            },
            {
                "render": function (data, type, row) {
                    if (data.name == null) {
                        return "";
                    }
                    return data.name
                },
                "targets": 2
            },
            {
                "render": function (data, type, row) {
                    if (data.description == null) {
                        return "";
                    }
                    return data.description
                },
                "targets": 3
            },
            {
                "render": function (data, type, row) {
                    var toReturn = "<ul>";
                    for (var game of data.games) {
                        toReturn += "<li>" + game.name + "</li>"
                    }
                    toReturn += "</ul>";
                    return toReturn
                },
                "targets": 4
            },
            {
                "render": function (data, type, row) {
                    if (data.guests == null) {
                        return "0"
                    }
                    return data.guests.length;
                },
                "targets": 5
            },
            {
                "render": function (data, type, row) {
                    return "<button type='button' class='btn btn-success validate'><i class='fa fa-check'></i> S'inscrire</button>"
                },
                "targets": 6
            }
        ]
    initDatatable("invitations-table", "/user-nights", nightsColumns, nightsColumnDefs);
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
            {"data": null, "visible": true, "searchable": true},
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
                "render": function ( data, type, row ) {
                    if (data.description == null) {
                        return "";
                    }
                    return data.description;
                },
                "targets": 2
            },
            {
                "render": function (data, type, row) {
                    return data.minPlayers + " / " + data.maxPlayers
                },
                "targets": 3
            }
        ]
    playableGamesTable = initDatatable("playable-games-table", "/games", playableGamesColumns, playableGamesColumnDefs);

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

// TODO 
var nightsIncomming = function() {
    /*
        0 : Etat soirée
        1 : Date
        2: Horaire
        3 : Nom soiree
        4 : Nom jeu
        5 : Nbr participants
        6 : Confirmer (si le jeu est confirme)
    */
    var nightsIncommingColumns = [
        {"data": null, "visible": true, "orderable": false},
        {"data": null, "visible": true, "searchable": true},
        {"data": null, "visible": true, "searchable": true},
        {"data": "name", "visible": true, "searchable": true},
        {"data": "game.name", "visible": true, "searchable": true},
        {"data": "nbParticipants", "visible": true, "searchable": true},
        {"data": null, "visible": true, "orderable": false}

    ];

    var nightsIncommingColumnDefs = [
        {
            "render": function ( data, type, row ) {
                return data.status;
            },
            "targets": 0
        },
        {
            "render": function ( data, type, row ) {
                var date = moment(data.date);
                return date.format("DD / MM / YYYY");
            },
            "targets": 1
        },
        {
            "render": function (data, type, row) {
                var startTime = moment(data.startTime);
                var endTime = moment(data.endTime);
                return startTime.format("HH:mm") + ":" + endTime.format("HH:mm");
            },
            "targets": 2
        },
        {
            "render": function (data, type, row) {
                if (data.status == "CONFIRMED")
                    return "<i class='fa fa-check' style='color: green;'></i>";
                else
                    return "<i class='fa fa-times' style='color: tomato;'></i>"
            },
            "targets": 6
        }
    ];

    initDatatable("nights-resume-table", "/upCommingNights", nightsIncommingColumns, nightsIncommingColumnDefs);

}

var User = (function() {
    function logIn() {
		if (! $('#formLogin').valid()) {
			return;
		} else {
	        $.ajax({
	            url: "/login",
	            type: "post",
	            data: formToJson("formLogin"),
	            success: function(data, status, jqXHR) {
                    if (! data.success) {
                        Utils.notifyError(data.message);
                    } else {
    	                Utils.notifySucces(data.message);
    	                connected = true;
    	                Init.navUser();
                    }
	            }, error: function(jqXHR, status, err) {
	                Utils.notifyError(err);
	            }
	        }).done(function() {
                if (connected) {
	               functionsAfterConnection();
                }
	        })
	    }
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
    	if (! $('#formInscription').valid()) {
    		return;
    	} else {
    		$.ajax({
	            url: "/signup",
	            type: "post",
	            data: formToJson("formInscription"),
	            success: function(data, status, jqXHR) {
                    if (! data.success) {
                        Utils.notifyError(data.message);
                    } else {
    	                Utils.notifySucces(data.message);
    	                setTimeout(function() {
    	                    location.reload();
    	                }, 1000);
                    }
	            }, error: function(jqXHR, status, err) {
	                Utils.notifyError("Une erreur s'est produite: " + err);
	            }
	        })
    	} 
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
        if (! $('#addGameForm').valid()) {
        	return;
        } else {
			$.ajax({
	            url: "/game",
	            type: "post",
	            data: formToJson("addGameForm"),
	            success: function(data, status, jqXHR) {
                    if (! data.success) {
                        Utils.notifyError(data.message);
                    } else {
    	                Utils.notifySucces("Jeu ajouté avec succès");
                        gamesTable.ajax.url("/games").load();
    	                playableGamesTable.ajax.url("/games").load();
                    }
	            }, error: function(jqXHR, status, err) {
	                Utils.notifyError(status);
	            }
        	})
        }
    });

    $("#buttonModalAddGame").on('click', function(e) {
        e.preventDefault();
        if (! $('#modalFormAddGame').valid()) {
        	return;
        } else {
			$.ajax({
	            url: "/game",
	            type: "post",
	            data: formToJson("modalFormAddGame"),
	            success: function(data, status, jqXHR) {
                    if (! data.success) {
                        Utils.notifyError(data.message);
                    } else {
    	            	$(".modal.in").modal("hide");
    	                Utils.notifySucces(data.message);
                        gamesTable.ajax.url("/games").load();
    	                playableGamesTable.ajax.url("/games").load();
                    }
	            }, error: function(jqXHR, status, err) {
	                Utils.notifyError(status);
	            }
        	})
        }
    })

    // List all games
    var gamesColumns = [
            {"data": "image", "visible": true, "orderable": false},
            {"data": "name", "visible": true, "searchable": true},
            {"data": null, "visible": true, "searchable": true},
            {"data": null, "visible": true, "searchable": false}
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

var CheckInputForm = (function() {

	// Private attributes
	var validatorFormInscription;
	var validatorFormLogin;
	var validatorFormCreation;
	var validatorAddGameForm;
	var validatorModalFormAddGame;
	// Form validation
	var validationFormLogin = {
		rules: {
			email: {
				required: true,
				email: true,
				maxlength: 255
			},
			password: {
				required: true,
                minlength: 4,
				maxlength: 35
			}
		},
		messages: {
			email: {
				required: "Veuillez indiquer votre email",
				email: "Format email incorrect [exemple@gmail.com]"
			},
			password:  {
                required: "Veuillez indiquer votre mot de passe",
                minlength: "Mot de passe de minimum 4 caractères"
            }
		}
	};

	var validationFormInscription = {
		rules: {
                lastname: {
                    required: true,
                    maxlength: 35
                },
                firstname: {
                    required: true,
                    maxlength: 35
                },
                email: {
                    required: true,
                    email: true,
                    maxlength: 255
                },
                password: {
                    required: true,
                    minlength: 4
                },
                passwordConfirmation: {
                    required: true,
                    minlength: 4,
                    equalTo: "#insc-password"
                }
        },
        messages: {
                lastname: "Veuillez indiquer votre nom",
                firstname: "Veuillez indiquer votre prénom",
                email: "L'email est invalide",
                password: {
                    required: "Veuillez indiquer votre mot de passe",
                    minlength: "Minimum 4 caractères"
                },
                passwordConfirmation: {
                	required: "",
                    minlength: "Minimum 4 caractères",
                	equalTo: "Les deux mots de passes ne correspondent pas"
                }
        }
	};

	var validationFormCreation = {
		rules: {
                name: {
                    required: true,
                    maxlength: 35
                },
                date: {
                    required: true,
                    maxlength: 35
                },
                description: {
                    maxlength: 1000
                },
                startTime: {
                    required: true
                },
                endTime: {
                    required: true                }
        },
        messages: {
                name: "Veuillez indiquer le nom de la soirée",
                date: "Veuillez indiquer la date de la soirée",
                description: "La description ne peut dépasser 1000 caractères",
                startTime: {
                	required: "Veuillez indiquer l'heure de départ"
                },
                endTime: "Veuillez indiquer l'heure de fin"
        }
	}

	var validationAddGameForm = {
		rules: {
                name: {
                    required: true,
                    maxlength: 35
                },
                description: {
                	required: true,
                    maxlength: 1000
                },
                minPlayers: {
                    required: true, 
                    number: true
                },
                maxPlayers: {
                    required: true,
                    number : true
                }
        },
        messages: {
                name: "Veuillez indiquer le nom du jeu",
                description: {
                	required: "Veuillez indiquer une description",
                	maxlength: "La description ne peut dépasser 1000 caractères"
                },
                minPlayers: {
                	required: "Veuillez indiquer le nombre minimum de joueurs",
                	number: "Format incorrect"
                },
                maxPlayers: {
                	required: "Veuillez indiquer le nombre maximum de joueurs",
                	number: "Format incorrect"
                }
        }
	}

	function initValidatorPlugin() {
		// override jquery validate plugin defaults
		$.validator.setDefaults({
		    highlight: function(element) {
		        $(element).closest('.form-group').addClass('has-error');
		    },
		    unhighlight: function(element) {
		        $(element).closest('.form-group').removeClass('has-error');
		    },
		    errorElement: 'span',
		    errorClass: 'help-block',
		    errorPlacement: function(error, element) {
		        if(element.parent('.input-group').length) {
		            error.insertAfter(element.parent());
		        } else {
		            error.insertAfter(element);
		        }
    		}
		});
	}

	function initAllValidatorForm() {
		validatorFormLogin = $('#formLogin').validate(validationFormLogin);
		validatorFormInscription = $('#formInscription').validate(validationFormInscription);
		validatorFormCreation = $('#formCreation').validate(validationFormCreation);
		validatorAddGameForm = $('#addGameForm').validate(validationAddGameForm);
		validatorModalFormAddGame = $('#modalFormAddGame').validate(validationAddGameForm);
	}

	// Clear Form
	function clearFormLogin() {
		$('#formLogin').find(':input').val('');
		validatorFormLogin.resetForm();
	}

	function clearFormInscription() {
		$('#formInscription').find(':input').val('');
		validatorFormInscription.resetForm();
	}

	function clearFormCreation() {
		$('#formCreation').find(':input').val('');
		validatorFormCreation.resetForm();
	}

	function clearAddGameForm() {
		$('#addGameForm').find(':input').val('');
		validatorAddGameForm.resetForm();
	}

	function clearModalFormAddGame() {
		$('#modalFormAddGame').find(':input').val('');
		validatorModalFormAddGame.resetForm();
	}


	return {
		initValidatorPlugin: initValidatorPlugin,
		initAllValidatorForm: initAllValidatorForm,
		clearFormLogin: clearFormLogin,
		clearFormInscription: clearFormInscription,
		clearFormCreation: clearFormCreation,
		clearAddGameForm: clearAddGameForm,
		clearModalFormAddGame: clearModalFormAddGame
	}
})();

// Visual + Click event
var Init = (function() {
    
    function all() {
        $('#butNotYetRegister').click(function() {
            Utils.toggleDiv('divInscription');
            CheckInputForm.clearFormInscription();
        });
        $('#butRegisterReturn').click(function() {
            Utils.toggleDiv('divConnexion');
            CheckInputForm.clearFormLogin();
        });
        $('#butLogIn').click(function() {
            User.logIn();
        });
        $("#butRegister").click(function() {
            User.register();
        });
        $("#disconnection").click(function() {
            User.logOut();
        });


        $('#buttonModalReturn').click(function() {
        	CheckInputForm.clearModalFormAddGame();
        });

        $('.modal').on('hidden.bs.modal', function(){
        	$("#modalFormAddGame").find('.has-error').removeClass("has-error");
        	CheckInputForm.clearModalFormAddGame();
    	});

        CheckInputForm.initValidatorPlugin();
        CheckInputForm.initAllValidatorForm();
        
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
                    if ($(element).attr('id') !== undefined) {
                        var idDiv = "div" + element.id.substring(7);
                        Utils.toggleDiv(idDiv);
                        Utils.activeNavItem($(element).parent().closest('li[id]').attr('id'));

                        if (element.id === "displayManagementCreate") {
                            CheckInputForm.clearFormCreation();
                        } else if (element.id === "displayGames") {
                            CheckInputForm.clearAddGameForm();
                        }
                    } 
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
        $(currentActive).removeClass("active");
        if (navItemToDisplay.substring(0,18) === 'displayManagement') {
            navItemToDisplay = 'management';
        }
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
