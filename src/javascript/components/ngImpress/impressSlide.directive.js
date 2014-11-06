var angular = require('angular');
var controller = require('./impress.controller');
var template = require('./impressSlide.html');

var directive = function($window) {
  return {
    restrict: 'EA',
    require: '^impress',
    scope: {
      'headline': '=',
      'currentState': '=',
      'states': '='
    },
    link: function(scope, element, attrs, ctrl) {
      ctrl.updateState();
    },
    replace: true,
    template: template
  };
};
directive.$inject = ['$window'];
directive.DIRECTIVE_NAME = 'impressSlide';

module.exports = directive;
