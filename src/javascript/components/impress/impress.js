var angular = require('angular');
var ImpressService = require('./impress.service');
var ImpressSlideDirective = require('./impressSlide.directive');

var component = angular.module('ngImpress', []);
component.service('Impress', ImpressService);
component.directive(ImpressSlideDirective.DIRECTIVE_NAME, ImpressSlideDirective);

module.exports = component;
