var angular = require('angular');
var ImpressService = require('./impress.service');
var ImpressDirective = require('./impress.directive');
var ImpressSlideDirective = require('./impressSlide.directive');

var component = angular.module('ngImpress', []);
component.service('Impress', ImpressService);
component.directive(ImpressDirective.DIRECTIVE_NAME, ImpressDirective);
component.directive(ImpressSlideDirective.DIRECTIVE_NAME, ImpressSlideDirective);

module.exports = component;
