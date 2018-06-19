require.config({
  waitSeconds: 10,
  paths: {
    jquery: 'libs/jquery-2.1.4.min',
    Modernizr: 'libs/modernizr-custom',
    underscore: 'libs/underscore-min',
    backbone: 'libs/backbone-min',
    turf: 'https://npmcdn.com/@turf/turf/turf.min',
//    piste: 'https://planet.procedural.eu/procedural-js/latest/procedural'
//    piste: 'https://planet.procedural.eu/procedural-js/0.2.2/procedural'
    piste: 'https://planet.procedural.eu/procedural-js/0.3.1/procedural'
  },
  shim: {
  }
});

// Load our app module and pass it to our definition function
require(['controller/DefApp'], function(App){
  App.initialize();
})
