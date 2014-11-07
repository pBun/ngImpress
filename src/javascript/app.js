var angular = require('angular');
var ngImpress = require('./components/ngImpress/impress');
var ImpressCtrl = require('./app/impressDemo.controller');

var app = angular.module('testApp', [
  ngImpress.name
]);
app.controller('ImpressCtrl', ImpressCtrl);

angular.bootstrap(document.body, [app.name]);
