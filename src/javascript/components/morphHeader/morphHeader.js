var angular = require('angular');
var MorphHeaderDirective = require('./morphHeader.directive');

var component = angular.module('MorphHeaderModule', []);
component.directive(MorphHeaderDirective.DIRECTIVE_NAME, MorphHeaderDirective);

module.exports = component;
