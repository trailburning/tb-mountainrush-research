require.config({
  waitSeconds: 10,
  paths: {
    jquery: 'libs/jquery-2.1.4.min',
    Modernizr: 'libs/modernizr-custom',
    underscore: 'libs/underscore-min',
    backbone: 'libs/backbone-min',
    turf: 'http://api.tiles.mapbox.com/mapbox.js/plugins/turf/v1.4.0/turf.min',
//    piste: 'https://www.procedural.eu/js-sdk/scripts/procedural.demo'
    piste: 'https://planet.procedural.eu/procedural-js/latest/procedural'
  },
  shim: {
  }
});

// Load our app module and pass it to our definition function
require(['controller/DefApp'], function(App){
  App.initialize();
})
