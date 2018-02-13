var app = app || {};

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

    var mountain3DView = null;
    var arrRouteCoords = null;
    var nCurrPlayer = -1;

    function getJourney(journeyID) {
      var url = "https://api.trailburning.com/v2/journeys/" + journeyID;
//      console.log(url);
      $.getJSON(url, function(result){
        var jsonJourney = result.body.journeys[0];
        mountainModel = new Backbone.Model(jsonJourney);

        arrRouteCoords = jsonJourney.route_points;

        setupMap();
      });
    }

    function setupMap(mountain3DName) {
      var arrMapPoint = arrRouteCoords[Math.round(arrRouteCoords.length / 2)].coords;

      mountain3DView = new Mountain3DView({ el: '#map-view', arrMapPoint: arrMapPoint });
      mountain3DView.show();
      mountain3DView.render();
    }

    function setupMapPoint(arrMapPoint) {
      mountain3DView = new Mountain3DView({ el: '#map-view', arrMapPoint: arrMapPoint });
      mountain3DView.show();
      mountain3DView.render();
    }

    function onLocationLoaded() {
      if (arrRouteCoords) {
        mountain3DView.addRouteData(arrRouteCoords);
        mountain3DView.addPlayer(0, 3000, "http://forum.jedox.com/wcf/images/avatars/d1/14-d1d779416bac6c1973e66fa698d040efc412ea3a.png");
        mountain3DView.addPlayer(1, 15000, "https://dgalywyr863hv.cloudfront.net/pictures/athletes/270394/7302003/9/large.jpg");
      }
    }

    function onFeaturesLoaded() {
      var arrCoord = arrRouteCoords[arrRouteCoords.length - 1];

      mountain3DView.locationFocus(arrCoord.coords[1], arrCoord.coords[0]);
      setTimeout(function(){ 
        mountain3DView.attractor();
      }, 4000);
    }

//    setupMapPoint([6.894093, 45.877274]); // Mont Blanc

    getJourney('5a44843c9d4a5373279579'); // Mont Blanc
//    getJourney('5875843c37d99829635908'); // Mitterhorn 2056m Run
//    getJourney('59a0091680d4a677217766'); // Monte Pelmo 2416m Run
//    getJourney('59a180c711b0c944854494'); // Großglockner 2173m Run
//    getJourney('59a81f06d979a652643814'); // Großglockner 1506m Ride
//    getJourney('5a17e966d9fc7578335574'); // Großglockner 2651m Run
//    getJourney('59ac026a9c3cb236198760'); // Mitterhorn 514m Run
//    getJourney('59ac5e1a9e28d359148596'); // Mitterhorn 1264m Ride
//    getJourney('59d4ad31a276a319404809'); // Monte Pelmo 2947m Run

    $('.fly').click(function(evt){
      mountain3DView.playRoute();
    });

    $('.spin').click(function(evt){
      mountain3DView.spin();
    });

    $('.addsnow').click(function(evt){
      mountain3DView.addSnow();
    });

    $('.removeplayers').click(function(evt){
      mountain3DView.removePlayer(0);
      mountain3DView.removePlayer(1);
    });

    $('.toggleplayer').click(function(evt){
      switch (nCurrPlayer) {
        case -1:
          mountain3DView.selectPlayer(0);
          nCurrPlayer = 0;
          break;

        case 0:
          mountain3DView.selectPlayer(1);
          nCurrPlayer = 1;
          break;

        case 1:
          mountain3DView.selectPlayer(0);
          nCurrPlayer = 0;
          break;
      }
    });
  };

  return { 
    initialize: initialize
  };
});

