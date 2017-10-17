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

    var mountain3DView = null;
    var jsonRoute = null;
    var nCurrPlayer = -1;

    function getJourney(journeyID) {
      var url = "https://api.trailburning.com/v2/journeys/" + journeyID;
//      console.log(url);
      $.getJSON(url, function(result){
        var jsonJourney = result.body.journeys[0];
        mountainModel = new Backbone.Model(jsonJourney);

        jsonRoute = {
          "type": "Feature",
          "properties": {
          "name": "Hello World",
          "color": "#000000",
          },
          "geometry": {
            "type": "LineString",
            "coordinates": []
          }
        };
        // build geoJSON route
        $.each(mountainModel.get('route_points'), function(index) {
          jsonRoute.geometry.coordinates.push(this.coords);
        });

        setupMap();
      });
    }

    function setupMap(mountain3DName) {
      var arrMapPoint = jsonRoute.geometry.coordinates[Math.round(jsonRoute.geometry.coordinates.length / 2)];

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
      if (jsonRoute) {
        mountain3DView.addRouteData(jsonRoute);
        mountain3DView.addPlayer1(jsonRoute);
        mountain3DView.addPlayer2(jsonRoute);
      }
    }

//    setupMapPoint([6.868858, 45.836865]);
    getJourney('5875843c37d99829635908'); // Mitterhorn 2056m Run
//    getJourney('59a0091680d4a677217766'); // Monte Pelmo 2416m Run
//    getJourney('59a180c711b0c944854494'); // Großglockner 2173m Run
//    getJourney('59a81f06d979a652643814'); // Großglockner 1506m Ride
//    getJourney('59ac026a9c3cb236198760'); // Mitterhorn 514m Run
//    getJourney('59ac5e1a9e28d359148596'); // Mitterhorn 1264m Ride
//    getJourney('59d4ad31a276a319404809'); // Monte Pelmo 28336m Run

    $('.addsnow').click(function(evt){
      mountain3DView.addSnow();
    });

    $('.removeplayers').click(function(evt){
      mountain3DView.removePlayer1();
      mountain3DView.removePlayer2();
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

