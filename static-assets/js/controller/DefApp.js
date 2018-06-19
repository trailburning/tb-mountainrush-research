var app = app || {};

var GAME_API_URL  = 'http://mountainrush.trailburning.com/tb-game-api/';

define([
  'underscore',
  'backbone',
  'views/Mountain3DView'
], function(_, Backbone, Mountain3DView){
  app.dispatcher = _.clone(Backbone.Events);

  _.templateSettings = {
      evaluate:    /\{\{(.+?)\}\}/g,
      interpolate: /\{\{=(.+?)\}\}/g,
      escape:      /\{\{-(.+?)\}\}/g
  };

  var initialize = function() {
    var self = this;

    app.dispatcher.on("Mountain3DView:onLocationLoaded", onLocationLoaded);
    app.dispatcher.on("Mountain3DView:onFeaturesLoaded", onFeaturesLoaded);
    app.dispatcher.on("Mountain3DView:onFeatureClicked", onFeatureClicked);

    var jsonPlayers = new Array;
    var mountainModel = null;
    var mountainEventsCollection = null;
    var mountain3DView = null;
    var arrRouteCoords = null;
    var nCurrPlayer = -1;
    var nCurrMarker = -1;

    function getJourneyEvents(journeyID) {
      var url = "https://api.trailburning.com/v2/journeys/" + journeyID + '/events';
//      console.log(url);
      $.getJSON(url, function(result){
        mountainEventsCollection = new Backbone.Collection(result.body.events);
        setupMap();
      });
    }

    function getJourney(journeyID) {
      var url = "https://api.trailburning.com/v2/journeys/" + journeyID;
//      console.log(url);
      $.getJSON(url, function(result){
        var jsonJourney = result.body.journeys[0];
        mountainModel = new Backbone.Model(jsonJourney);

        arrRouteCoords = jsonJourney.route_points;

        getJourneyEvents(journeyID);
      });
    }

    function setupMap(mountain3DName) {
      // modify images to use image proxy
      var strImageHost = GAME_API_URL + 'imageproxy.php?url=';

      var arrMapPoint = arrRouteCoords[Math.round(arrRouteCoords.length / 2)].coords;

      mountain3DView = new Mountain3DView({ el: '#map-view', arrMapPoint: arrMapPoint, geography: 2 });
      mountain3DView.show();
      mountain3DView.render();
    }

    function setupMapPoint(arrMapPoint) {
      mountain3DView = new Mountain3DView({ el: '#map-view', arrMapPoint: arrMapPoint, geography: 2 });
      mountain3DView.show();
      mountain3DView.render();
    }

    function addMapMarkers() {
      // modify images to use image proxy
      var strImageHost = GAME_API_URL + 'imageproxy.php?url=';
      var fProgressKM = jsonPlayers[0].progress;
      var bEnabled = false;
      var latestEnabledMarkerID = 0;

      mountainEventsCollection.each(function(event, index) {
        var strImage = '';

        // select 1st image asset
        $.each(event.get('assets')[0].media, function(index, media){
          if (media.mime_type == 'image/jpeg') {
            strImage = media.path + '?fm=jpg&w=64&h=64&fit=crop&q=80';
          }
        });
        strImage = strImageHost + strImage;

        bEnabled = mountain3DView.addMarker(event.get('id'), event.get('coords'), fProgressKM, 0.04, strImage, strImageHost + 'http://mountainrush.trailburning.com/static-assets/images/markers/marker-event-unlocked.png', strImageHost + 'http://mountainrush.trailburning.com/static-assets/images/markers/marker-event-locked.png');

        if (bEnabled) {
          latestEnabledMarkerID = event.get('id');
        }
      });

      return latestEnabledMarkerID;
    }

    function onLocationLoaded() {
      // modify avatar to use image proxy
      var strAvatarHost = GAME_API_URL + 'imageproxy.php?url=';

      if (arrRouteCoords) {
        var objPlayer1 = new Object();
        objPlayer1.id = 'player1';
        objPlayer1.step = 3;
        objPlayer1.progress = 4;
        objPlayer1.elevationGainPercent = 0;
        objPlayer1.imagePath = strAvatarHost + 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/270394/7302003/9/large.jpg';
        jsonPlayers.push(objPlayer1);

        var objPlayer2 = new Object();
        objPlayer2.id = 'player2';
        objPlayer2.step = 2;
        objPlayer2.progress = 3;
        objPlayer2.elevationGainPercent = 0;
        objPlayer2.imagePath = strAvatarHost + 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/2546781/7075915/1/large.jpg';
        jsonPlayers.push(objPlayer2);

        mountain3DView.addRouteData(arrRouteCoords);
        mountain3DView.addFlag(strAvatarHost + "http://mountainrush.trailburning.com/static-assets/images/markers/marker-location.png");
        mountain3DView.showBaseData();

        addMapMarkers();
/*
        var strImage = '';
        mountainEventsCollection.each(function(event, index) {
          switch (index) {
            case 0:
              strImage = strAvatarHost + 'http://mountainrush.trailburning.com/static-assets/images/wwfuk-climb/stories/gorilla.jpg'
              break;

            default:
              strImage = strAvatarHost + 'http://mountainrush.trailburning.com/static-assets/images/wwfuk-climb/stories/baby.jpg'
              break;
          }
          mountain3DView.addMarker('marker' + index, event.get('coords'), strImage, strAvatarHost + 'http://mountainrush.trailburning.com/static-assets/images/markers/marker-event-unlocked.png', strAvatarHost + 'http://mountainrush.trailburning.com/static-assets/images/markers/marker-event-locked.png');
        });
*/
        var playerCollection = new Backbone.Collection(jsonPlayers);
        mountain3DView.addPlayers(playerCollection);
      }
    }

    function onFeaturesLoaded() {
      mountain3DView.showMarkers();
      mountain3DView.selectPlayer('player1');
      nCurrPlayer = 0;
    }

    function onFeatureClicked(id) {
      switch (id) {
        case FLAG_ID:
          mountain3DView.playRoute();
          break;

        default:
          mountain3DView.selectFeature(id);
          break;
      }
    }

//    setupMapPoint([6.894093, 45.877274]); // Mont Blanc
//    setupMapPoint([29.6, -1.4]); // Mount Sabyinyo
//    setupMapPoint([7.749117, 46.020713]); // Zermatt
//    setupMapPoint([10.985365, 47.421066]); // Zugspitze

    getJourney('5aab77247169c568617867'); // Mount Sabyinyo
//    getJourney('5a44843c9d4a5373279579'); // Mont Blanc
//    getJourney('5875843c37d99829635908'); // Mitterhorn 2056m Run
//    getJourney('59a180c711b0c944854494'); // Großglockner 2651m Run
//    getJourney('59d4ad31a276a319404809'); // Monte Pelmo 2947m Run
//    getJourney('5aeaf2b4cfa39386959545'); // Zugspitze

    $('.fly').click(function(evt){
      mountain3DView.playRoute();
    });

    $('.spin').click(function(evt){
      mountain3DView.spin();
    });

    $('.addsnow').click(function(evt){
      mountain3DView.addSnow();
    });

    $('.summit').click(function(evt){
      mountain3DView.selectFlag();
    });

    $('.cycleplayer').click(function(evt){
      switch (nCurrPlayer) {
        case -1:
          mountain3DView.showMarkers();
          mountain3DView.selectPlayer('player1');
          nCurrPlayer = 0;
          break;

        case 0:
          mountain3DView.hideMarkers();
          mountain3DView.selectPlayer('player2');
          nCurrPlayer = 1;
          break;

        case 1:
          mountain3DView.showMarkers();
          mountain3DView.selectPlayer('player1');
          nCurrPlayer = 0;
          break;
      }
    });

    $('.cyclemarker').click(function(evt){
      switch (nCurrMarker) {
        case -1:
          mountain3DView.selectMarker(0);
          nCurrMarker = 0;
          break;

        case 0:
          mountain3DView.selectMarker(1);
          nCurrMarker = 1;
          break;

        case 1:
          mountain3DView.selectMarker(2);
          nCurrMarker = 2;
          break;

        case 2:
          mountain3DView.selectMarker(3);
          nCurrMarker = 3;
          break;

        case 3:
          mountain3DView.selectMarker(0);
          nCurrMarker = 0;
          break;
      }
    });
  };

  return { 
    initialize: initialize
  };
});

