var SEASON_SUMMER_EUROPE  = 0;
var SEASON_WINTER_EUROPE  = 1;
var SEASON_SUMMER_EQUATOR  = 2;

var ROUTE_ID = 3000;
var FLAG_ID = 4000;

var STATE_INIT = 0;
var STATE_READY = 1;
var STATE_SELECT_PLAYER = 2;
var STATE_SELECT_PLAYER_AND_ORBIT = 3;

var MOUNTAIN_TYPE_GULLYS = 0;
var MOUNTAIN_TYPE_SMOOTH = 1;

define([
  'underscore', 
  'backbone',
  'turf',
  'piste'
], function(_, Backbone, turf, piste){

  var Mountain3DView = Backbone.View.extend({
    initialize: function(options){
      this.options = options;

      this.nState = STATE_INIT;
      this.timeoutID = null;
      this.playerCollection = null;
      this.arrMarkers = new Array;
      this.jsonRoute = null;
      this.jsonFlag = null;
      this.bFlagVisible = false;
      this.currPlayerID = null;
      this.arrRouteCoords = null;
    },

    hide: function(){
      $(this.el).hide();
    },

    show: function(){
      $(this.el).show();
    },

    showBaseData: function(){
      var jsonMapRoute = {
        "name": "Route",
        "type": "FeatureCollection",
        "features": [
        {
          "id": ROUTE_ID,
          "type": "Feature",
          "properties": {
            "selectable": false,
            "name": "",
            "color": "#f75f36",
            "thickness": 3
          },
          "geometry": {
            "type": "LineString",
            "coordinates": []
          }
        }
        ]
      };

      $.each(this.arrRouteCoords, function(index) {
        jsonMapRoute.features[0].geometry.coordinates.push(this.coords);
      });

      Procedural.addOverlay( jsonMapRoute );
      this.showFlag();
    },

    addRouteData: function(arrRouteCoords){
      this.arrRouteCoords = arrRouteCoords;

      this.jsonRoute = {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": []
        }
      };

      var self = this;
      $.each(arrRouteCoords, function(index) {
        self.jsonRoute.geometry.coordinates.push(this.coords);
      });
    },

    selectPlayer: function(id, bOrbitPlayer){
      var player = null;

      if (this.timeoutID) {
        window.clearTimeout(this.timeoutID);
      }

      this.nState = STATE_SELECT_PLAYER;

      if (bOrbitPlayer) {
        this.nState = STATE_SELECT_PLAYER_AND_ORBIT;
        this.hideFlag();
      }
      else {
        this.showFlag();
      }

      // remove current player
      if (this.currPlayerID) {
        player = this.playerCollection.get(this.currPlayerID);
        Procedural.removeOverlay( String(player.get('jsonPlayer').features[0].id) );
      }

      this.currPlayerID = id;

      player = this.playerCollection.get(id);
      Procedural.addOverlay( player.get('jsonPlayer') );
    },

    showPlayer: function(id){
      var player = this.playerCollection.get(id);
      Procedural.addOverlay( player.get('jsonPlayer') );
    },

    hidePlayer: function(id){
      var player = this.playerCollection.get( id );
      Procedural.removeOverlay( String(player.get('jsonPlayer').features[0].id) );
    },

    addPlayers: function(playerCollection){
      var self = this;
      var jsonPlayer = null;
      var bMultiPlayer = false;

      if (playerCollection.length > 1) {
        bMultiPlayer = true;
      }

      this.playerCollection = playerCollection;

      this.playerCollection.each(function(model, index){
        jsonPlayer = self.buildPlayerJSON(model.get('id'), model.get('progress'), model.get('imagePath'), index+1, bMultiPlayer);
        model.set('jsonPlayer', jsonPlayer);
      });
    },

    buildPlayerJSON: function(id, fProgressKM, strAvatar, nPosLabel, bShowPosLabel){
      var along = turf.along(this.jsonRoute, fProgressKM, {units: 'kilometers'});
      var fLat = along.geometry.coordinates[1];
      var fLong = along.geometry.coordinates[0];

      var jsonPlayer = {
        "name": id,
        "features": [ 
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "selectable": false,
              "borderRadius": 30,
              "image": strAvatar,
              "height": 60,
              "width": 60,
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
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "fontSize": 12,
              "anchor": {
                "y": 5,
                "x": 0
              },
              "icon": "caret-down"
            }
          },
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "selectable": false,
              "name": String(nPosLabel),
              "borderRadius": 23,
              "padding": 5,
              "fontSize": 13,
              "background": "#44b6f7",
              "anchor": "bottom"
            }
          }
        ]
      }

      if (!bShowPosLabel) {
        jsonPlayer = {
        "name": id,
        "features": [ 
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "selectable": false,
              "borderRadius": 30,
              "image": strAvatar,
              "height": 60,
              "width": 60,
              "borderWidth": 2,
              "background": "#ccc",
              "anchor": {
                "y": 1.4,
                "x": 0
              }
            }
          },
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "fontSize": 12,
              "anchor": {
                "y": 1.7,
                "x": 0
              },
              "icon": "caret-down"
            }
          }
        ]
      }

      }

      return jsonPlayer;
    },

    selectMarker: function(nID){
      Procedural.focusOnFeature(MARKER_BASE_ID + nID);
    },

    hideMarkers: function(){
      $.each(this.arrMarkers, function(index, jsonMarker){
        Procedural.removeOverlay(jsonMarker.name);
      });
    },

    showMarkers: function(){
      $.each(this.arrMarkers, function(index, jsonMarker){
        Procedural.addOverlay(jsonMarker);
      });

      // fire event
      app.dispatcher.trigger("Mountain3DView:onMarkersReady");
    },

    buildMarkerOff: function(id, fLat, fLong, strMarkerImageOff, nFadeDistance){
      var jsonMarker = {
        "name": id,
        "features": [ 
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "selectable": false,
              "fadeDistance": nFadeDistance,
              "borderRadius": 12,
              "image": strMarkerImageOff,
              "height": 24,
              "width": 24,
              "borderWidth": 2,
              "anchor": {
                "y": 1.2,
                "x": 0
              }
            }
          }
        ]
      }
      return jsonMarker;
    },

    buildMarkerOn: function(id, fLat, fLong, strMarkerImage, strMarkerImageOn, nFadeDistance){
      jsonMarker = {
        "name": id,
        "features": [ 
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "selectable": true,
              "fadeDistance": nFadeDistance,
              "borderRadius": 24,
              "image": strMarkerImage,
              "height": 48,
              "width": 48,
              "borderWidth": 2,
              "anchor": {
                "y": 2.5,
                "x": 0
              }
            }
          },
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id,
            "properties": {
              "fadeDistance": nFadeDistance,
              "fontSize": 12,
              "anchor": {
                "y": 5.5,
                "x": 0
              },
              "icon": "caret-down"
            }
          },
          {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": id + 'marker',
            "properties": {
              "selectable": false,
              "fadeDistance": nFadeDistance,
              "borderRadius": 32,
              "image": strMarkerImageOn,
              "height": 24,
              "width": 24,
              "borderWidth": 2,
              "anchor": {
                "y": 1.2,
                "x": 0
              }
            }
          }

        ]
      }
      return jsonMarker;
    },

    addMarker: function(id, coord, fProgressKM, fProgressTriggerKM, strMarkerImage, strMarkerImageOn, strMarkerImageOff){
      var pt = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": []
        }
      }
      var nFadeDistance = 7000;

      // look for point on line
      pt.geometry.coordinates[1] = coord[0];
      pt.geometry.coordinates[0] = coord[1];

      var snapped = turf.pointOnLine(this.jsonRoute, pt);
      
      fLat = snapped.geometry.coordinates[1];
      fLong = snapped.geometry.coordinates[0];

      // slice route at point
      var ptStart = turf.point([this.jsonRoute.geometry.coordinates[0][0], this.jsonRoute.geometry.coordinates[0][1]]);
      var ptMarker = turf.point([fLong, fLat]);
      var sliced = turf.lineSlice(ptStart, ptMarker, this.jsonRoute.geometry);

      var fMarkerKM = turf.length(sliced, {units: 'kilometers'});
      var bEnable = false;
      if (Number(fProgressKM) >= Number(fMarkerKM + fProgressTriggerKM)) {
        bEnable = true;
      }

      if (bEnable) {
        jsonMarker = this.buildMarkerOn(id, fLat, fLong, strMarkerImage, strMarkerImageOn, nFadeDistance);
      }
      else {
        jsonMarker = this.buildMarkerOff(id, fLat, fLong, strMarkerImageOff, nFadeDistance);
      }
      this.arrMarkers.push(jsonMarker);

      return bEnable;
    },

    showFlag: function() {
      if (!this.bFlagVisible) {
        this.bFlagVisible = true;

        Procedural.addOverlay( this.jsonFlag );
      }
    },

    hideFlag: function() {
      if (this.bFlagVisible) {
        this.bFlagVisible = false;

        Procedural.removeOverlay( this.jsonFlag.features[0].id );
      }
    },

    addFlag: function(strImage) {
      var fLat = this.jsonRoute.geometry.coordinates[this.jsonRoute.geometry.coordinates.length-1][1];
      var fLong = this.jsonRoute.geometry.coordinates[this.jsonRoute.geometry.coordinates.length-1][0];

      var jsonFlag = {
        "name": FLAG_ID,
        "features": [ {
            "geometry": {
              "type": "Point",
              "coordinates": [ fLong, fLat ]
            },
            "type": "Feature",
            "id": FLAG_ID,
            "properties": {
              "selectable": true,
              "image": strImage,
              "height": 39,
              "width": 32,
              "anchor": {
                "y": 1.2,
                "x": 0
              }
            }
          }
        ]
      }
      this.jsonFlag = jsonFlag;
    },

    selectFlag: function(){
      var coords = this.jsonFlag.features[0].geometry.coordinates;
      Procedural.focusOnLocation( {latitude: coords[1], longitude: coords[0], distance: 2000, angle: 20} );
    },

    selectFeature: function(id){
      Procedural.focusOnFeature(id);
    },

    spin: function(){
      Procedural.orbitTarget();
    },

    focusLocation: function(fLat, fLong){
      Procedural.focusOnLocation( {latitude: fLat, longitude: fLong, distance: 1000, angle: 10} );
    },

    focusLocationWithOptions: function(fLat, fLong, fDistance, fAngle){
      Procedural.focusOnLocation( {latitude: fLat, longitude: fLong, distance: fDistance, angle: fAngle} );
    },

    playRoute: function(){
      Procedural.animateAlongFeature( ROUTE_ID, { distance: 1800, speed: 500 } );
    },

    campaignAttractor: function(){
      Procedural.animateAlongFeature( ROUTE_ID, { distance: 2500, speed: 200 } );
    },

    attractor: function(){
      Procedural.orbitTarget();
    },

    setSeason: function(nSeason){
      switch (nSeason) {
        case SEASON_SUMMER_EUROPE:
          var geo = {
            title: 'summer',
            parameters: {
              snowTop: 2800,
              snowBottom: 2700,
              snowInclination: 0.25
            }
          };
          Procedural.setGeography( geo );
          break;

        case SEASON_WINTER_EUROPE:
          var geo = {
            title: 'winter',
            parameters: {
              snowTop: 100,
              snowBottom: 100,
              snowInclination: 1
            }
          };
          Procedural.setGeography( geo );
          break;

        case SEASON_SUMMER_EQUATOR:
          Procedural.setGeography( {
            "parameters" : {
              "snowTop" : 5000,
              "snowBottom" : 4999,
              "rockTop": 5000,
              "rockBottom": 4999,
              "treeColor": "#49850a",
              "grassColor": "#5f6d2a"
            }
          } );
          break;
      }
    },

    render: function(){
      var self = this;

      var init = function () {
        // render season
        self.setSeason(self.options.geography);

        Procedural.displayLocation( { latitude: self.options.arrMapPoint[1], longitude: self.options.arrMapPoint[0] } );
        Procedural.onLocationLoaded = function () {
          var container = self.el;
          Procedural.init( container );

          // fire event
          app.dispatcher.trigger("Mountain3DView:onLocationLoaded");
        };

        Procedural.onFeaturesLoaded = function () {
          switch (self.nState) {
            case STATE_INIT:
              self.nState = STATE_READY;

              // fire event
              app.dispatcher.trigger("Mountain3DView:onFeaturesLoaded");
              break;

            case STATE_SELECT_PLAYER:
              self.nState = STATE_READY;

              var fAngle = 0;
              // what sort of mountain do we have?
              switch (self.options.mountainType) {
                case MOUNTAIN_TYPE_SMOOTH:
                  fAngle = 10;
                  break;

                default:
                  // use progress to calc camera angle
                  var model = self.playerCollection.get(self.currPlayerID);
                  fAngle = Math.round(model.get('elevationGainPercent') / 2) + 8;
                  break;
              }

              var coords = self.playerCollection.get(self.currPlayerID).get('jsonPlayer').features[0].geometry.coordinates;
              Procedural.focusOnLocation( {latitude: coords[1], longitude: coords[0], distance: 500, angle: fAngle} );
              break;

            case STATE_SELECT_PLAYER_AND_ORBIT:
              self.nState = STATE_READY;

              var coords = self.playerCollection.get(self.currPlayerID).get('jsonPlayer').features[0].geometry.coordinates;
              Procedural.focusOnLocation( {latitude: coords[1], longitude: coords[0], distance: 2000, angle: 20} );

              // take a spin around!
              self.timeoutID = setTimeout(function(){ 
                Procedural.orbitTarget();
              }, 4000);
              break;

            default:
              break;
          }
        };

        Procedural.onFeatureClicked = function ( id ) {
          // fire event
          app.dispatcher.trigger("Mountain3DView:onFeatureClicked", id);
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
