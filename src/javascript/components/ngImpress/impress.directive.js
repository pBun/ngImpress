var angular = require('angular');
var controller = require('./impress.controller');

var directive = function($window, Impress) {
  return {
    restrict: 'EA',
    scope: {

    },
    controller: controller,
    link: function(scope, element, attrs, ctrl) {

      scope.root = element;

      // Check support
      var impressSupported = Impress.checkSupport();
      if (!impressSupported) {
        // we can't be sure that `classList` is supported
        element.addClass(directive.NOT_SUPPORTED_CLASS);
      } else {
        element.removeClass(directive.NOT_SUPPORTED_CLASS);
        element.addClass(directive.SUPPORTED_CLASS);
      }

    },
    transclude: true,
    replace: true,
    template: '<div class="' + directive.NOT_SUPPORTED_CLASS + '" data-ng-transclude></div>'
  };
};
directive.$inject = ['$window', 'Impress'];
directive.DIRECTIVE_NAME = 'impress';
directive.SUPPORTED_CLASS = 'impress-supported';
directive.NOT_SUPPORTED_CLASS = 'impress-not-supported';

module.exports = directive;
