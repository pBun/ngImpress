var angular = require('angular');
var controller = require('./impress.controller');

var directive = function($window) {
  return {
    restrict: 'EA',
    scope: {

    },
    controller: controller,
    link: function(scope, element, attrs, ctrl) {
      scope.root = element;
    },
    transclude: true
  };
};
directive.$inject = ['$window'];
directive.DIRECTIVE_NAME = 'impress';

module.exports = directive;
