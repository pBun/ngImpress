var angular = require('angular');
var controller = require('./impress.controller');

var directive = function($window, Impress) {
  return {
    restrict: 'EA',
    scope: {
      'rootId': '=?id'
    },
    controller: controller,
    link: function(scope, element, attrs, api) {

      scope.element = element;
      scope.root = element[0];

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

      // Prevent default keydown action when one of supported key is pressed.
      element.on('keydown', function ( event ) {
          if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
              event.preventDefault();
          }
      });

      // Trigger impress action (next or prev) on keyup.

      // Supported keys are:
      // [space] - quite common in presentation software to move forward
      // [up] [right] / [down] [left] - again common and natural addition,
      // [pgdown] / [pgup] - often triggered by remote controllers,
      // [tab] - this one is quite controversial, but the reason it ended up on
      //   this list is quite an interesting story... Remember that strange part
      //   in the impress.js code where window is scrolled to 0,0 on every presentation
      //   step, because sometimes browser scrolls viewport because of the focused element?
      //   Well, the [tab] key by default navigates around focusable elements, so clicking
      //   it very often caused scrolling to focused element and breaking impress.js
      //   positioning. I didn't want to just prevent this default action, so I used [tab]
      //   as another way to moving to next step... And yes, I know that for the sake of
      //   consistency I should add [shift+tab] as opposite action...
      element.on("keyup", function ( event ) {
          if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
              switch( event.keyCode ) {
                  case 33: // pg up
                  case 37: // left
                  case 38: // up
                           api.prev();
                           break;
                  case 9:  // tab
                  case 32: // space
                  case 34: // pg down
                  case 39: // right
                  case 40: // down
                           api.next();
                           break;
              }

              event.preventDefault();
          }
      });

      // delegated handler for clicking on the links to presentation steps
      element.on("click", function ( event ) {
          // event delegation with "bubbling"
          // check if event target (or any of its parents is a link)
          var target = event.target;
          while ( (target.tagName !== "A") &&
                  (target !== document.documentElement) ) {
              target = target.parentNode;
          }

          if ( target.tagName === "A" ) {
              var href = target.getAttribute("href");

              // if it's a link to presentation step, target this step
              if ( href && href[0] === '#' ) {
                  target = document.getElementById( href.slice(1) );
              }
          }

          if ( api.goto(target) ) {
              event.stopImmediatePropagation();
              event.preventDefault();
          }
      });

      // delegated handler for clicking on step elements
      element.on("click", function ( event ) {
          var target = event.target;
          // find closest step element that is not active
          while ( !(target.classList.contains("step") && !target.classList.contains("active")) &&
                  (target !== document.documentElement) ) {
              target = target.parentNode;
          }

          if ( api.goto(target) ) {
              event.preventDefault();
          }
      });

      // touch handler to detect taps on the left and right side of the screen
      // based on awesome work of @hakimel: https://github.com/hakimel/reveal.js
      element.on("touchstart", function ( event ) {
          if (event.touches.length === 1) {
              var x = event.touches[0].clientX,
                  width = window.innerWidth * 0.3,
                  result = null;

              if ( x < width ) {
                  result = api.prev();
              } else if ( x > window.innerWidth - width ) {
                  result = api.next();
              }

              if (result) {
                  event.preventDefault();
              }
          }
      });

      // rescale presentation when window is resized
      var onWindowResize = Impress.throttle(function () {
          // force going to active step again, to trigger rescaling
          api.goto( document.querySelector(".step.active"), 500 );
      }, 250);
      angular.element($window).on("resize", onWindowResize);
      scope.$on('$destroy', function() {
        angular.element($window).off('resize', onWindowResize);
      });

      // Adding hash change support.
      // last hash detected
      scope.lastHash = "";
      var onHashChange = function () {
          // When the step is entered hash in the location is updated
          // (just few lines above from here), so the hash change is
          // triggered and we would call `goto` again on the same element.
          //
          // To avoid this we store last entered hash and compare.
          if (window.location.hash !== scope.lastHash) {
              api.goto( Impress.getElementFromHash() );
          }
      };
      angular.element($window).on("hashchange", onHashChange);
      scope.$on('$destroy', function() {
        angular.element($window).off('hashchange', onHashChange);
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
