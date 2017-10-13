define([
  'underscore', 
  'backbone',
  'piste'
], function(_, Backbone, piste){

  var Mountain3DView = Backbone.View.extend({
    initialize: function(options){
      this.options = options;

      this.jsonMapRoute = {
        "name": "Route",
        "type": "FeatureCollection",
        "features": []
      }
    },

    hide: function(){
      $(this.el).hide();
    },

    show: function(){
      $(this.el).show();
    },

    addRouteData: function(jsonRoute){
      var jsonMapRoute = {
        "id": 99,
        "type": "Feature",
        "properties": {
          "name": "Hello World",
          "color": "#f75f36",
          "thickness": 3
        },
        "geometry": {
          "type": "LineString",
          "coordinates": []
        }
      };
      jsonMapRoute.geometry.coordinates = jsonRoute.geometry.coordinates;
      this.jsonMapRoute.features.push(jsonMapRoute);
      Procedural.addOverlay( this.jsonMapRoute );
    },

    selectPlayer: function(nPlayer){
      Procedural.focusOnFeature(nPlayer);
    },

    addPlayer1: function(jsonRoute){
      var jsonLabel = {
        "id": 0,
        "name": "player1",
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            12.701107,
            47.572986,
            1000
          ]
        },
        "properties": {
          "image": "https://scontent.xx.fbcdn.net/v/t1.0-1/p320x320/17022059_1884048141837162_2312116276217952972_n.jpg?oh=f54f730e4c5d034c5e14b5c957946b46&oe=5A5C14B5"
        }
      }
      this.jsonMapRoute.features.push(jsonLabel);
      Procedural.addOverlay( this.jsonMapRoute );
    },

    addPlayer2: function(jsonRoute){
      var jsonLabel = {
        "id": 1,
        "name": "player2",
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            12.69037,
            47.57404,
            1000
          ]
        },
        "properties": {
          "image": "https://dgalywyr863hv.cloudfront.net/pictures/athletes/2546781/7075915/1/large.jpg"
        }
      }
      this.jsonMapRoute.features.push(jsonLabel);
      Procedural.addOverlay( this.jsonMapRoute );
    },

    removePlayer1: function(){
      Procedural.removeOverlay( 'player1' );
    },

    removePlayer2: function(){
      Procedural.removeOverlay( 'player2' );
    },

    playRoute: function(){
      Procedural.animateAlongFeature( 99, { distance: 500, speed: 500 } );
    },

    render: function(){
      var self = this;

      var init = function () {
        Procedural.displayLocation( { latitude: self.options.arrMapPoint[1], longitude: self.options.arrMapPoint[0] } );
        Procedural.onLocationLoaded = function () {
          var container = self.el;
          Procedural.init( container );

          // fire event
          app.dispatcher.trigger("Mountain3DView:onLocationLoaded");
        };

        Procedural.onFeaturesLoaded = function () {
         console.log( 'Features loaded' );
        };
      };

      // When engine is ready initialize
      if ( Procedural.ready ) {
        init();
      } else {
        Procedural.onReady = init;
      }

      return this;
    }

  });

  return Mountain3DView;
});
