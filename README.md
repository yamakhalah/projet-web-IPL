# projet-web-IPL
# To launch:
npm install
npm start

# Détail important a noter:
Une partie des routes est déjà couverte par app/api.js (notament pour chopper tous les utilisateurs ou tous les jeux),
en bref tous les éléments qui ne sont pas relationnels peuvent être post ou get depuis cet objet
donc l'appel ajax ressemblera à ça pour chopper tous les jeux: 
$.ajax({
    url: "/game",               // /game/idDuJeu pour un seul jeu
    method: "GET",
    success: function() {},
    error: function() {}
})