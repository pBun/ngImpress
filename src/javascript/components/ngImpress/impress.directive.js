var angular = require('angular');
var controller = require('./impress.controller');

var directive = function($window, Impress) {
  return {
    restrict: 'EA',
    scope: {
      'rootId': '=?id',
      'width': '=?',
      'height': '=?',
      'maxScale': '=?',
      'minScale': '=?',
      'perspective': '=?',
      'transitionDuration': '=?'
    },
    controller: controller,
    link: function(scope, element, attrs, api) {

      scope.element = element;
      scope.root = element[0];

      // Remove focus outline (huge performance issues and it looks weird)
      element[0].style.outline = 0;

      // Check support
      var impressSupported = Impress.checkSupport();
      if (!impressSupported) {
        // we can't be sure that `classList` is supported
        element.addClass(directive.NOT_SUPPORTED_CLASS);
      } else {
        element.removeClass(directive.NOT_SUPPORTED_CLASS);
        element.addClass(directive.SUPPORTED_CLASS);
      }

      // initialize
      api.init();

      // Bind events
      element.on('keydown', api.onKeydown.bind(api));
      element.on("keyup", api.onKeyup.bind(api));
      element.on("click", api.onClick.bind(api));
      element.on("touchstart", api.onTouchstart.bind(api));
      var onWindowResize = Impress.throttle(function() {
        api.onWindowResize();
      }, 250);
      angular.element($window).on("resize", onWindowResize);
      angular.element($window).on("hashchange", api.onHashChange.bind(api));

      // unbind window/doc events on scope destroy
      scope.$on('$destroy', function() {
        angular.element($window).off('resize', onWindowResize);
        angular.element($window).off('hashchange', api.onHashChange);
      });


    },
    transclude: true,
    replace: true,
    template: '<div class="' + directive.NOT_SUPPORTED_CLASS + '" tabindex="0" data-ng-transclude></div>'
  };
};
directive.$inject = ['$window', 'Impress'];
directive.DIRECTIVE_NAME = 'impress';
directive.SUPPORTED_CLASS = 'impress-supported';
directive.NOT_SUPPORTED_CLASS = 'impress-not-supported';

module.exports = directive;
