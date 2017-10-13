require.config({
  waitSeconds: 10,
  paths: {
    jquery: 'libs/jquery-2.1.4.min',
    Modernizr: 'libs/modernizr-custom',
    underscore: 'libs/underscore-min',
    backbone: 'libs/backbone-min',
    piste: 'https://www.procedural.eu/js-sdk/scripts/procedural.demo'
  },
  shim: {
  }
});

// Load our app module and pass it to our definition function
require(['controller/DefApp'], function(App){
  App.initialize();
})
