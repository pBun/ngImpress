var angular = require('angular');
var FullScreenDirective = require('./fullScreen.directive');

var component = angular.module('FullScreen', []);
component.directive(FullScreenDirective.DIRECTIVE_NAME, FullScreenDirective);

module.exports = component;
