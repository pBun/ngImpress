var angular = require('angular');
var controller = require('./fullScreen.controller');

var directive = function($window) {
  return {
    restrict: 'EA',
    scope: {
      'nativeWidth': '@',
      'nativeHeight': '@',
      'offsetTop': '@',
      'offsetBottom': '@',
      'offsetLeft': '@',
      'offsetRight': '@'
    },
    controller: controller,
    controllerAs: 'FullScreenCtrl',
    link: function(scope, element, attrs) {

      element.css({'position': 'absolute'});

      // TODO: there must be a way to set defaults cleaner
      var nativeWidth = Number(attrs.nativeWidth) || element.innerWidth;
      var nativeHeight = Number(attrs.nativeHeight) || element.innerHeight;
      var offsetTop = Number(attrs.offsetTop) || 0;
      var offsetBottom = Number(attrs.offsetBottom) || 0;
      var offsetLeft = Number(attrs.offsetLeft) || 0;
      var offsetRight = Number(attrs.offsetRight) || 0;
      var eleRatio = nativeWidth / nativeHeight;

      // TODO: move this to prototype or something so we don't create the function for every directive
      function adjustStyling() {
        var wrapperWidth = $window.innerWidth;
        var wrapperHeight = $window.innerHeight;
        var styles = scope.FullScreenCtrl.getUpdatedStyles(eleRatio, wrapperWidth, wrapperHeight, offsetTop, offsetBottom, offsetLeft, offsetRight);
        element[0].style.height = styles.height + 'px';
        element[0].style.width = styles.width + 'px';
        element.css({'top': styles.top + 'px', 'left': styles.left + 'px'});
      }

      adjustStyling();
      angular.element(window).on('resize', adjustStyling);

    }
  };
};
directive.$inject = ['$window'];

directive.DIRECTIVE_NAME = 'fullScreen';

module.exports = directive;
