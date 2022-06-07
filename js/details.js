const API_KEY = 'f33cd318f5135dba306176c13104506a';

let title = document.getElementById('title');
let image = document.getElementById('image');
let createdBy = document.getElementById('createdBy');
let genre = document.getElementById('genre');
let seasons = document.getElementById('seasons');

let cardSeason;

//creation du tableau qui contient les id d'episode
let tabIdEpisode = [];

//si localstorage existant, on le recuperer
if(window.localStorage.getItem("MaBiblioSerie") != null){
    tabIdEpisode = JSON.parse(window.localStorage.getItem("MaBiblioSerie"));
}

//recupereration de l'id present dans l'url
let url_String = window.location.href;
let url = new URL(url_String);

let id = url.searchParams.get("id");

//appel des informatiosn détaillés de la série
fetch('http://api.themoviedb.org/3/tv/'+id+'?language=fr&api_key='+API_KEY)
.then(function(httpResponse){
    return httpResponse.json();
})
.then(function(body){
    title.innerHTML = body.name;
    image.innerHTML = '<img class="img-fluid" src="https://image.tmdb.org/t/p/w500'+body.poster_path+'" >';
    
    let strCreatedBy = "";
    body.created_by.forEach(element => {
        //si la chaine contient deja du texte alors on mets une virgule
        if(strCreatedBy != ""){
            strCreatedBy += ", ";
        }
        //on concatene le nom de l'element a la chaine existante
        strCreatedBy += element.name;
    });
    createdBy.innerHTML = strCreatedBy;

    let strGenre = "";
    body.genres.forEach(element => {
        //si la chaine contient deja du texte alors on mets une virgule
        if(strGenre != ""){
            strGenre += ", ";
        }
        //on concatene le nom de l'element a la chaine existante
        strGenre += element.name;
    });
    genre.innerHTML = strGenre;

    //construction des blocs de saisons
    let strSeason = "";
    body.seasons.forEach(element => {
        //div que l'on verra
        strSeason += '<div data-id="'+element.season_number+'" class="cardSeason">'+element.name+'</div>';
        //div qui est vide et qui permettra d'afficher les episodes
        strSeason += '<div id="season_'+element.season_number+'"></div>';
    })
    seasons.innerHTML = strSeason;

    //ajout des ecouteur d'evenement sur chaque bloc
    cardSeason = document.querySelectorAll('.cardSeason');
    cardSeason.forEach((element) =>  {
        element.addEventListener('click', showEpisode);
    })

});

function showEpisode(e /*evenement*/){
    let seasonNumber = e.currentTarget.dataset.id;
    
    //appel de l'api pour recuperer les episode par saison
    fetch('http://api.themoviedb.org/3/tv/'+id+'/season/'+seasonNumber+'?language=fr&api_key='+API_KEY)
    .then(function(httpResponse){
        return httpResponse.json();
    })
    .then(function(body){

        //on lie la variale a l'element HTML au moment du clic, pas avant car il n'existe pas
        let blocEpisode = document.getElementById('season_'+seasonNumber);
        if(blocEpisode.innerHTML == ""){
            
            let strEpisode = "";
            body.episodes.forEach(element => {
                let checked = "";
                //si l'id est présent dans le tableau, alors on coche la checkbox
                if(tabIdEpisode.find(id => id == element.id)){
                    checked = 'checked="checked"';
                }
                //ecriture de la checkobox dans le HTML
                strEpisode += "<div><input "+checked+" class=\"inputStorage\" data-id=\""+element.id+"\" type=\"checkbox\"> "+element.name+"</div>";
            });
            
            blocEpisode.innerHTML = strEpisode;

            //detection des toutes les case a cocher pour mettre l'ecouteur d'evenement
            let allInput = document.querySelectorAll('.inputStorage');
            allInput.forEach(element => {
                element.addEventListener('change', saveToLocalStorage);
            })
        }else{
            blocEpisode.innerHTML = "";
        }
    });
}

function saveToLocalStorage(e){
    let idEpisode = e.currentTarget.dataset.id;
    //si l'id n'est pas present on le pousse sinon on le retire du tableau
    if(tabIdEpisode.indexOf(idEpisode) == -1){
        tabIdEpisode.push(idEpisode);
    }else{
        tabIdEpisode.splice(tabIdEpisode.indexOf(idEpisode), 1);
    }
    
    //on pousse la tableau dans le local sotrage
    window.localStorage.setItem("MaBiblioSerie", JSON.stringify(tabIdEpisode));
}