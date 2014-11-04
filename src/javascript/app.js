var angular = require('angular');
var ngRoute = require('angular-route');
var ngImpress = require('./components/impress/impress');
var MorphHeaderModule = require('./components/morphHeader/morphHeader');
var FullScreenModule = require('./components/fullScreen/fullScreen');
var AppCtrl = require('./app/app.controller');
var ImpressCtrl = require('./app/impressDemo.controller');

var app = angular.module('testApp', [
  'ngRoute',
  MorphHeaderModule.name,
  FullScreenModule.name,
  ngImpress.name
]);
app.controller('AppCtrl', AppCtrl);
app.controller('ImpressCtrl', ImpressCtrl);

// routes
app.config(['$routeProvider',
function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: '/templates/splash.html',
      controller: 'AppCtrl'
    }).
    when('/impress', {
      templateUrl: '/templates/impress-demo.html',
      controller: 'ImpressCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

angular.bootstrap(document.body, [app.name]);

console.log('app.js loaded!');
