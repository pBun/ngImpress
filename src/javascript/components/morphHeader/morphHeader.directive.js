var angular = require('angular');
var controller = require('./morphHeader.controller');
var template = require('./morphHeader.html');

var directive = function($window) {
  return {
    restrict: 'EA',
    scope: {
      'headline': '=',
      'currentState': '=',
      'states': '='
    },
    controller: controller,
    link: function(scope, element, attrs, ctrl) {
      ctrl.updateState();
    },
    replace: true,
    template: template
  };
};
directive.$inject = ['$window'];
directive.DIRECTIVE_NAME = 'morphHeader';

module.exports = directive;
