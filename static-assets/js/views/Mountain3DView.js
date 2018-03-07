define([
  'underscore', 
  'backbone',
  'turf',
  'piste'
], function(_, Backbone, turf, piste){

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

    addRouteData: function(arrRouteCoords){
      var jsonMapRoute = {
        "id": 99,
        "type": "Feature",
        "properties": {
          "selectable": false,
          "name": "Hello World",
          "color": "#f75f36",
          "thickness": 3
        },
        "geometry": {
          "type": "LineString",
          "coordinates": []
        }
      };

      $.each(arrRouteCoords, function(index) {
        jsonMapRoute.geometry.coordinates.push(this.coords);
      });

      this.jsonMapRoute.features.push(jsonMapRoute);
      Procedural.addOverlay( this.jsonMapRoute );
    },

    selectPlayer: function(nPlayer){
      Procedural.focusOnFeature(nPlayer);
    },

    addPlayer: function(nID, fProgressMetres, strAvatar, nSize){
      var fKilometres = (fProgressMetres / 1000);
      var along = turf.along(this.jsonMapRoute.features[0], fKilometres, 'kilometers');
      var fLat = along.geometry.coordinates[1];
      var fLng = along.geometry.coordinates[0];

      strAvatar = 'http://mountainrush.trailburning.com/tb-game-api/imageproxy.php?url=' + strAvatar;

      var jsonPlayer = {
        "name": 'player' + String(nID),
        "features": [ 
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLng, fLat ]
            },
            "type": "Feature",
            "id": nID,
            "properties": {
              "borderRadius": 32,
              "image": strAvatar,
              "height": nSize,
              "width": nSize,
              "borderWidth": 2,
              "background": "#ccc",
              "anchor": {
                "y": 2.1,
                "x": 0
              }
            }
          },
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLng, fLat ]
            },
            "type": "Feature",
            "id": nID,
            "properties": {
              "fontSize": 20,
              "anchor": {
                "y": 3.2,
                "x": 0
              },
              "icon": "caret-down"
            }
          },
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLng, fLat ]
            },
            "type": "Feature",
            "id": nID,
            "properties": {
              "name": String(nID+1),
              "borderRadius": 23,
              "padding": 5,
              "fontSize": 13,
              "background": "#44b6f7",
              "anchor": "bottom"
            }
          }
        ]
      }

      Procedural.addOverlay( jsonPlayer );
    },

    removePlayer: function(nID){
      Procedural.removeOverlay( 'player' + String(nID) );
    },

    addFlag: function(strImage) {
      strImage = 'http://mountainrush.trailburning.com/tb-game-api/imageproxy.php?url=' + strImage;

      var fLat = this.jsonMapRoute.features[0].geometry.coordinates[this.jsonMapRoute.features[0].geometry.coordinates.length-1][1];
      var fLng = this.jsonMapRoute.features[0].geometry.coordinates[this.jsonMapRoute.features[0].geometry.coordinates.length-1][0];

      var jsonFlag = {
        "features": [ {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLng, fLat ]
            },
            "type": "Feature",
            "id": 100,
            "properties": {
              "selectable": false,
              "image": strImage,
              "height": 80,
              "width": 80,
              "anchor": {
                "y": 1.2,
                "x": 0
              }
            }
          }
        ]
      }

      Procedural.addOverlay( jsonFlag );
    },

    addSnow: function(){
      var geo = {
        title: 'winter',
        parameters: {
          snowTop: 100,
          snowBottom: 100,
          snowInclination: 1
        }
      };
      Procedural.setGeography( geo );
    },

    spin: function(){
      Procedural.orbitTarget();
    },

    playRoute: function(){
      Procedural.animateAlongFeature( 99, { distance: 3000, speed: 800 } );
    },

    locationFocus: function(fLat, fLng){
      Procedural.focusOnLocation({
        latitude: fLat,
        longitude: fLng
      });
    },

    attractor: function(){
      Procedural.orbitTarget();
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
          // fire event
          app.dispatcher.trigger("Mountain3DView:onFeaturesLoaded");
        };

        Procedural.onFeatureClicked = function ( id ) {
          console.log( 'Feature clicked:', id );
        }
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
