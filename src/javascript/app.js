var angular = require('angular');
var ngRoute = require('angular-route');
var ngImpress = require('./components/ngImpress/impress');
var ImpressCtrl = require('./app/impressDemo.controller');

var app = angular.module('testApp', [
  'ngRoute',
  ngImpress.name
]);
app.controller('ImpressCtrl', ImpressCtrl);

// routes
app.config(['$routeProvider',
function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: '/templates/impress-demo.html',
      controller: 'ImpressCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

angular.bootstrap(document.body, [app.name]);

console.log('app.js loaded!');
