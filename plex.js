exports.action = function(data, callback, config, SARAH){
  var sectionSerieUrl='';
  config = config.modules.plex;
  if (!config.server){ 
    console.log("Missing Plex server config");
    callback({'tts' : 'Il manque la configuration du serveur plex'});
    return;    
  }     
  if (!config.client){ 
    console.log("Missing client config");
    callback({'tts' : 'Il manque la configuration du client'});
    return; 
  } 
  if (config.Sectionserie) {
    sectionSerieUrl='library/sections/'+config.Sectionserie+'/recentlyAdded';
  }
 switch (data.action)
  {
  case 'client':
    get_plexClient(callback, config);
    break;
  case 'lastAdd':
      get_lastAdd(sectionSerieUrl, callback, config);
    break;
  case 'navigation':
    navigation(data.commande, callback, config);
  break;
  case 'playback':
    playback(data.commande, callback, config);
  break;
  default:
  output(callback, "Je ne sais pas faire cela "); 
  }
 
}


var playback = function(action, callback, config) {
  commande = 'system/players/'+config.client+'/playback/'+action;
  getPlex(commande, config, callback) ;

};
var navigation = function(action, callback, config) {
  commande = 'system/players/'+config.client+'/navigation/'+action;
  getPlex(commande, config, callback) ;

};
var get_lastAdd = function(section, callback, config){
  console.log('');
  console.log('#### PLEX ####');
  console.log('');
  console.log('Récupération des derniers ajouts');
  getPlex( section, config, function(res){ 
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser({trim: true});
      parser.parseString(res, function (err, xml){
        var retour ='';
        if(!xml.MediaContainer.Video){
          retour ='Vous n\'avez rien de nouveau';
        }else{
          retour += 'Je regarde sur Plex ce qui a été ajouté et que vous n\'avez pas vus.';
          for (var i=0 ; i < 10 ; i++) 
             {  var hier = new Date();
                var ajout = xml.MediaContainer.Video[i].$.addedAt+'000';
                hier.setDate(hier.getDate() - config.lastAddTime);

                if (ajout > hier.getTime() && !xml.MediaContainer.Video[i].$.viewCount ){
                  if (xml.MediaContainer.Video[i].$.type == "movie")  {
                      retour+=' le film '+xml.MediaContainer.Video[i].$.title+' ';
                      }
                  if (xml.MediaContainer.Video[i].$.type == "episode")  {

                      retour+=' un épisode de '+xml.MediaContainer.Video[i].$.grandparentTitle+',';
                      } 
                }               
              }
              console.log(retour); 
               output(callback, retour);
          };
      });
  });
  console.log('');
  
}
var get_plexClient = function(callback, config){
  console.log('');
  console.log('#### PLEX ####');
  console.log('');
  console.log('Récupération des clients plex');
  getPlex('clients', config, function(res){ 
      var xml2js = require('xml2js');
      var parser = new xml2js.Parser({trim: true});
      parser.parseString(res, function (err, xml){
        
        var name ='';
        if (!xml.MediaContainer.Server) {
          name += 'J\'ai trouvé aucun client Plex';
          console.log('Pas de client connecté');
        }else { 
          var longeur = xml.MediaContainer.Server.length;
          name ="J'ai trouvé";
          for (var i=0 ; i < longeur ; i++) 
            { console.log(i);
              switch (i) 
              {
                case 0:
                  name += " ";
                  break;
                case 1:
                  name += " et ";
                  break;
                default:
                  name += ", ";
                  break;
              };
             name += xml.MediaContainer.Server[i].$.name ;
               
            } 
        };
        output(callback, name);
        
      });
  });
  console.log('');
  
}

      
var getPlex = function(commande, config, callback){ 
  var SERVER =config.server;
  var url = 'http://'+SERVER+':32400/'+commande;
  console.log(url);
 	var request = require('request'); 
  	request({ 'uri' : url}, function (err, response, body ) { 
 
  		if (err || response.statusCode != 200){
  			callback({'tts' : "La connexion à Plex a échoué"});
  			return;
  		}
        
  		callback(body);  
  }); 
} 



var output = function ( callback, output ) {
	//console.log('ACTION: ' + output);
	callback({ 'tts' : output});
}
 