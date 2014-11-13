var angular = require('angular');

var directive = function($window) {
  return {
    restrict: 'EA',
    require: '^impress',
    scope: {
      'x': '=?',
      'y': '=?',
      'z': '=?',
      'rotate': '=?',
      'rotateX': '=?',
      'rotateY': '=?',
      'rotateZ': '=?',
      'scale': '=?'
    },
    link: function(scope, element, attrs, api) {

      scope.el = element[0];

      api.initStep(scope);

      // delegated handler for clicking on step elements
      element.on("click", function(event) {
        if (api.goto(scope)) {
          event.preventDefault();
        }
      });

    },
    transclude: true,
    replace: true,
    template: '<div data-ng-transclude></div>'
  };
};
directive.$inject = ['$window'];
directive.DIRECTIVE_NAME = 'impressStep';

module.exports = directive;
