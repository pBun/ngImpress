var angular = require('angular');

var controller = function($scope, Impress) {

  this.impress = Impress;

  this.scope = $scope;

  // data of all presentation steps
  this.scope.stepsData = {};

  // element of currently active step
  this.scope.activeStep = null;

  // current state (position, rotation and scale) of the presentation
  this.scope.currentState = null;

  // array of step elements
  this.scope.steps = null;

  // this.scope.configuration options
  this.scope.config = null;

  // scale factor of the browser window
  this.scope.windowScale = null;

  // root presentation elements
  this.scope.rootId = this.scope.rootId || 'impress-root-impress';
  this.scope.canvas = document.createElement("div");

  this.scope.initialized = false;

  // reference to last entered step
  this.scope.lastEntered = null;

  // used to reset timeout for `impress:stepenter` event
  this.scope.stepEnterTimeout = null;

  // if given root is already this.scope.initialized just return the API
  if (Impress.roots[this.scope.rootId]) {
      return Impress.roots[this.scope.rootId];
  }

};
controller.$inject = ['$scope', 'Impress'];

// `onStepEnter` is called whenever the step element is entered
// but the event is triggered only if the step is different than
// last entered step.
controller.prototype.onStepEnter = function (step) {
    var $step = angular.element(step);
    if (this.scope.lastEntered !== step) {

        // update classes
        $step.removeClass("past");
        $step.removeClass("future");
        $step.addClass("present");

        // update hash
        window.location.hash = this.scope.lastHash = "#/" + step.id;

        this.scope.lastEntered = step;
    }
};

// `onStepLeave` is called whenever the step element is left
// but the event is triggered only if the step is the same as
// last entered step.
controller.prototype.onStepLeave = function (step) {
    var $step = angular.element(step);
    if (this.scope.lastEntered === step) {
        $step.removeClass("present");
        $step.addClass("past");
        this.scope.lastEntered = null;
    }
};

// `initStep` initializes given step element by reading data from its
// data attributes and setting correct styles.
controller.prototype.initStep = function ( el, idx ) {
    var data = el.dataset,
        step = {
            translate: {
                x: this.impress.toNumber(data.x),
                y: this.impress.toNumber(data.y),
                z: this.impress.toNumber(data.z)
            },
            rotate: {
                x: this.impress.toNumber(data.rotateX),
                y: this.impress.toNumber(data.rotateY),
                z: this.impress.toNumber(data.rotateZ || data.rotate)
            },
            scale: this.impress.toNumber(data.scale, 1),
            el: el
        };

    if ( !el.id ) {
        el.id = "step-" + (idx + 1);
    }

    this.scope.stepsData["impress-" + el.id] = step;

    this.impress.css(el, {
        position: "absolute",
        transform: "translate(-50%,-50%)" +
                   this.impress.translate(step.translate) +
                   this.impress.rotate(step.rotate) +
                   this.impress.scale(step.scale),
        transformStyle: "preserve-3d"
    });
};

// `init` API function that initializes (and runs) the presentation.
controller.prototype.init = function () {
    if (this.scope.initialized) { return; }

    // First we set up the viewport for mobile devices.
    // For some reason iPad goes nuts when it is not done properly.
    var meta = this.impress.$("meta[name='viewport']") || document.createElement("meta");
    meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
    if (meta.parentNode !== document.head) {
        meta.name = 'viewport';
        document.head.appendChild(meta);
    }

    // initialize this.scope.configuration object
    var rootData = this.scope.root.dataset;
    this.scope.config = {
        width: this.impress.toNumber( rootData.width, this.impress.defaults.width ),
        height: this.impress.toNumber( rootData.height, this.impress.defaults.height ),
        maxScale: this.impress.toNumber( rootData.maxScale, this.impress.defaults.maxScale ),
        minScale: this.impress.toNumber( rootData.minScale, this.impress.defaults.minScale ),
        perspective: this.impress.toNumber( rootData.perspective, this.impress.defaults.perspective ),
        transitionDuration: this.impress.toNumber( rootData.transitionDuration, this.impress.defaults.transitionDuration )
    };

    this.scope.windowScale = this.impress.computeWindowScale( this.scope.config );

    // wrap steps with "this.scope.canvas" element
    this.impress.arrayify( this.scope.root.childNodes ).forEach(function ( el ) {
        this.scope.canvas.appendChild( el );
    }.bind(this));
    this.scope.root.appendChild(this.scope.canvas);

    // set initial styles
    document.documentElement.style.height = "100%";

    this.impress.css(this.scope.root, {
        height: "100%",
        // overflow: "hidden"
    });

    var rootStyles = {
        position: "absolute",
        transformOrigin: "top left",
        transition: "all 0s ease-in-out",
        transformStyle: "preserve-3d"
    };

    this.impress.css(this.scope.root, rootStyles);
    this.impress.css(this.scope.root, {
        top: "50%",
        left: "50%",
        transform: this.impress.perspective( this.scope.config.perspective/this.scope.windowScale ) + this.impress.scale( this.scope.windowScale )
    });
    this.impress.css(this.scope.canvas, rootStyles);

    this.scope.root.classList.remove("impress-disabled");
    this.scope.root.classList.add("impress-enabled");

    // get and init steps
    this.scope.steps = this.impress.$$(".step", this.scope.root);
    this.scope.steps.forEach( this.initStep.bind(this) );

    // set a default initial state of the this.scope.canvas
    this.scope.currentState = {
        translate: { x: 0, y: 0, z: 0 },
        rotate:    { x: 0, y: 0, z: 0 },
        scale:     1
    };

    this.scope.initialized = true;

    // Init all steps with 'future' class
    this.scope.steps.forEach(function (step) {
        step.classList.add("future");
    });

    // START
    // by selecting step defined in url or first step of the presentation
    this.goto(this.impress.getElementFromHash() || this.scope.steps[0], 0);
};

// `getStep` is a helper function that returns a step element defined by parameter.
// If a number is given, step with index given by the number is returned, if a string
// is given step element with such id is returned, if DOM element is given it is returned
// if it is a correct step element.
controller.prototype.getStep = function ( step ) {
    if (typeof step === "number") {
        step = step < 0 ? this.scope.steps[ this.scope.steps.length + step] : this.scope.steps[ step ];
    } else if (typeof step === "string") {
        step = byId(step);
    }
    return (step && step.id && this.scope.stepsData["impress-" + step.id]) ? step : null;
};

// `goto` API function that moves to step given with `el` parameter (by index, id or element),
// with a transition `duration` optionally given as second parameter.
controller.prototype.goto = function ( el, duration ) {

    if ( !this.scope.initialized || !(el = this.getStep(el)) ) {
        // presentation not this.scope.initialized or given element is not a step
        return false;
    }

    // Sometimes it's possible to trigger focus on first link with some keyboard action.
    // Browser in such a case tries to scroll the page to make this element visible
    // (even that this.scope.root overflow is set to hidden) and it breaks our careful positioning.
    //
    // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
    // whenever slide is selected
    //
    // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
    window.scrollTo(0, 0);

    var step = this.scope.stepsData["impress-" + el.id];

    if ( this.scope.activeStep ) {
        this.scope.activeStep.classList.remove("active");
        this.scope.root.classList.remove("impress-on-" + this.scope.activeStep.id);
    }
    el.classList.add("active");

    this.scope.root.classList.add("impress-on-" + el.id);

    // compute target state of the this.scope.canvas based on given step
    var target = {
        rotate: {
            x: -step.rotate.x,
            y: -step.rotate.y,
            z: -step.rotate.z
        },
        translate: {
            x: -step.translate.x,
            y: -step.translate.y,
            z: -step.translate.z
        },
        scale: 1 / step.scale
    };

    // Check if the transition is zooming in or not.
    //
    // This information is used to alter the transition style:
    // when we are zooming in - we start with move and rotate transition
    // and the scaling is delayed, but when we are zooming out we start
    // with scaling down and move and rotation are delayed.
    var zoomin = target.scale >= this.scope.currentState.scale;

    duration = this.impress.toNumber(duration, this.scope.config.transitionDuration);
    var delay = (duration / 2);

    // if the same step is re-selected, force computing window scaling,
    // because it is likely to be caused by window resize
    if (el === this.scope.activeStep) {
        this.scope.windowScale = this.impress.computeWindowScale(this.scope.config);
    }

    var targetScale = target.scale * this.scope.windowScale;

    // trigger leave of currently active element (if it's not the same step again)
    if (this.scope.activeStep && this.scope.activeStep !== el) {
        this.onStepLeave(this.scope.activeStep);
    }

    // Now we alter transforms of `this.scope.root` and `this.scope.canvas` to trigger transitions.
    //
    // And here is why there are two elements: `this.scope.root` and `this.scope.canvas` - they are
    // being animated separately:
    // `this.scope.root` is used for scaling and `this.scope.canvas` for translate and rotations.
    // Transitions on them are triggered with different delays (to make
    // visually nice and 'natural' looking transitions), so we need to know
    // that both of them are finished.
    this.impress.css(this.scope.root, {
        // to keep the perspective look similar for different scales
        // we need to 'scale' the perspective, too
        transform: this.impress.perspective( this.scope.config.perspective / targetScale ) + this.impress.scale( targetScale ),
        transitionDuration: duration + "ms",
        transitionDelay: (zoomin ? delay : 0) + "ms"
    });

    this.impress.css(this.scope.canvas, {
        transform: this.impress.rotate(target.rotate, true) + this.impress.translate(target.translate),
        transitionDuration: duration + "ms",
        transitionDelay: (zoomin ? 0 : delay) + "ms"
    });

    // Here is a tricky part...
    //
    // If there is no change in scale or no change in rotation and translation, it means there was actually
    // no delay - because there was no transition on `this.scope.root` or `this.scope.canvas` elements.
    // We want to trigger `impress:stepenter` event in the correct moment, so here we compare the current
    // and target values to check if delay should be taken into account.
    //
    // I know that this `if` statement looks scary, but it's pretty simple when you know what is going on
    // - it's simply comparing all the values.
    if ( this.scope.currentState.scale === target.scale ||
        (this.scope.currentState.rotate.x === target.rotate.x && this.scope.currentState.rotate.y === target.rotate.y &&
         this.scope.currentState.rotate.z === target.rotate.z && this.scope.currentState.translate.x === target.translate.x &&
         this.scope.currentState.translate.y === target.translate.y && this.scope.currentState.translate.z === target.translate.z) ) {
        delay = 0;
    }

    // store current state
    this.scope.currentState = target;
    this.scope.activeStep = el;

    // And here is where we trigger `impress:stepenter` event.
    // We simply set up a timeout to fire it taking transition duration (and possible delay) into account.
    //
    // I really wanted to make it in more elegant way. The `transitionend` event seemed to be the best way
    // to do it, but the fact that I'm using transitions on two separate elements and that the `transitionend`
    // event is only triggered when there was a transition (change in the values) caused some bugs and
    // made the code really complicated, cause I had to handle all the conditions separately. And it still
    // needed a `setTimeout` fallback for the situations when there is no transition at all.
    // So I decided that I'd rather make the code simpler than use shiny new `transitionend`.
    //
    // If you want learn something interesting and see how it was done with `transitionend` go back to
    // version 0.5.2 of impress.js: http://github.com/bartaz/impress.js/blob/0.5.2/js/impress.js
    window.clearTimeout(this.scope.stepEnterTimeout);
    this.scope.stepEnterTimeout = window.setTimeout(function() {
        this.onStepEnter(this.scope.activeStep);
    }.bind(this), duration + delay);

    return el;
};

// `prev` API function goes to previous step (in document order)
controller.prototype.prev = function () {
    var prev = this.scope.steps.indexOf( this.scope.activeStep ) - 1;
    prev = prev >= 0 ? this.scope.steps[ prev ] : this.scope.steps[ this.scope.steps.length-1 ];

    return this.goto(prev);
};

// `next` API function goes to next step (in document order)
controller.prototype.next = function () {
    var next = this.scope.steps.indexOf( this.scope.activeStep ) + 1;
    next = next < this.scope.steps.length ? this.scope.steps[ next ] : this.scope.steps[ 0 ];

    return this.goto(next);
};

module.exports = controller;
