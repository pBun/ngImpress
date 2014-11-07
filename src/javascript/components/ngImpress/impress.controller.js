var angular = require('angular');

var controller = function($scope, Impress) {

  this.impress = Impress;

  // data of all presentation steps
  this.stepsData = {};

  // element of currently active step
  this.activeStep = null;

  // current state (position, rotation and scale) of the presentation
  this.currentState = null;

  // array of step elements
  this.steps = null;

  // this.configuration options
  this.config = null;

  // scale factor of the browser window
  this.windowScale = null;

  // root presentation elements
  this.rootId = this.scope.rootId || 'impress-root-impress';
  this.canvas = document.createElement("div");

  this.initialized = false;

  // reference to last entered step
  this.lastEntered = null;

  // used to reset timeout for `impress:stepenter` event
  this.stepEnterTimeout = null;

  // if given root is already this.initialized just return the API
  if (Impress.roots[this.rootId]) {
      return Impress.roots[this.rootId];
  }

};
controller.$inject = ['$scope', 'Impress'];

// `onStepEnter` is called whenever the step element is entered
// but the event is triggered only if the step is different than
// last entered step.
controller.prototype.onStepEnter = function (step) {
    var $step = angular.element(step);
    if (this.lastEntered !== step) {

        // update classes
        $step.removeClass("past");
        $step.removeClass("future");
        $step.addClass("present");

        // update hash
        window.location.hash = this.lastHash = "#/" + step.id;

        this.lastEntered = step;
    }
};

// `onStepLeave` is called whenever the step element is left
// but the event is triggered only if the step is the same as
// last entered step.
controller.prototype.onStepLeave = function (step) {
    var $step = angular.element(step);
    if (this.lastEntered === step) {
        $step.removeClass("present");
        $step.addClass("past");
        this.lastEntered = null;
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

    this.stepsData["impress-" + el.id] = step;

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
    if (this.initialized) { return; }

    // First we set up the viewport for mobile devices.
    // For some reason iPad goes nuts when it is not done properly.
    var meta = this.impress.$("meta[name='viewport']") || document.createElement("meta");
    meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
    if (meta.parentNode !== document.head) {
        meta.name = 'viewport';
        document.head.appendChild(meta);
    }

    // initialize this.configuration object
    var rootData = this.root.dataset;
    this.config = {
        width: this.impress.toNumber( rootData.width, this.impress.defaults.width ),
        height: this.impress.toNumber( rootData.height, this.impress.defaults.height ),
        maxScale: this.impress.toNumber( rootData.maxScale, this.impress.defaults.maxScale ),
        minScale: this.impress.toNumber( rootData.minScale, this.impress.defaults.minScale ),
        perspective: this.impress.toNumber( rootData.perspective, this.impress.defaults.perspective ),
        transitionDuration: this.impress.toNumber( rootData.transitionDuration, this.impress.defaults.transitionDuration )
    };

    this.windowScale = this.impress.computeWindowScale( this.config );

    // wrap steps with "this.canvas" element
    this.impress.arrayify( this.root.childNodes ).forEach(function ( el ) {
        this.canvas.appendChild( el );
    }.bind(this));
    this.root.appendChild(this.canvas);

    // set initial styles
    document.documentElement.style.height = "100%";

    this.impress.css(this.root, {
        height: "100%",
        // overflow: "hidden"
    });

    var rootStyles = {
        position: "absolute",
        transformOrigin: "top left",
        transition: "all 0s ease-in-out",
        transformStyle: "preserve-3d"
    };

    this.impress.css(this.root, rootStyles);
    this.impress.css(this.root, {
        top: "50%",
        left: "50%",
        transform: this.impress.perspective( this.config.perspective/this.windowScale ) + this.impress.scale( this.windowScale )
    });
    this.impress.css(this.canvas, rootStyles);

    this.root.classList.remove("impress-disabled");
    this.root.classList.add("impress-enabled");

    // get and init steps
    this.steps = this.impress.$$(".step", this.root);
    this.steps.forEach( this.initStep.bind(this) );

    // set a default initial state of the this.canvas
    this.currentState = {
        translate: { x: 0, y: 0, z: 0 },
        rotate:    { x: 0, y: 0, z: 0 },
        scale:     1
    };

    this.initialized = true;

    // Init all steps with 'future' class
    this.steps.forEach(function (step) {
        step.classList.add("future");
    });

    // START
    // by selecting step defined in url or first step of the presentation
    this.goto(this.impress.getElementFromHash() || this.steps[0], 0);
};

// `getStep` is a helper function that returns a step element defined by parameter.
// If a number is given, step with index given by the number is returned, if a string
// is given step element with such id is returned, if DOM element is given it is returned
// if it is a correct step element.
controller.prototype.getStep = function ( step ) {
    if (typeof step === "number") {
        step = step < 0 ? this.steps[ this.steps.length + step] : this.steps[ step ];
    } else if (typeof step === "string") {
        step = byId(step);
    }
    return (step && step.id && this.stepsData["impress-" + step.id]) ? step : null;
};

// `goto` API function that moves to step given with `el` parameter (by index, id or element),
// with a transition `duration` optionally given as second parameter.
controller.prototype.goto = function ( el, duration ) {

    if ( !this.initialized || !(el = this.getStep(el)) ) {
        // presentation not this.initialized or given element is not a step
        return false;
    }

    // Sometimes it's possible to trigger focus on first link with some keyboard action.
    // Browser in such a case tries to scroll the page to make this element visible
    // (even that this.root overflow is set to hidden) and it breaks our careful positioning.
    //
    // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
    // whenever slide is selected
    //
    // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
    window.scrollTo(0, 0);

    var step = this.stepsData["impress-" + el.id];

    if ( this.activeStep ) {
        this.activeStep.classList.remove("active");
        this.root.classList.remove("impress-on-" + this.activeStep.id);
    }
    el.classList.add("active");

    this.root.classList.add("impress-on-" + el.id);

    // compute target state of the this.canvas based on given step
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
    var zoomin = target.scale >= this.currentState.scale;

    duration = this.impress.toNumber(duration, this.config.transitionDuration);
    var delay = (duration / 2);

    // if the same step is re-selected, force computing window scaling,
    // because it is likely to be caused by window resize
    if (el === this.activeStep) {
        this.windowScale = this.impress.computeWindowScale(this.config);
    }

    var targetScale = target.scale * this.windowScale;

    // trigger leave of currently active element (if it's not the same step again)
    if (this.activeStep && this.activeStep !== el) {
        this.onStepLeave(this.activeStep);
    }

    // Now we alter transforms of `this.root` and `this.canvas` to trigger transitions.
    //
    // And here is why there are two elements: `this.root` and `this.canvas` - they are
    // being animated separately:
    // `this.root` is used for scaling and `this.canvas` for translate and rotations.
    // Transitions on them are triggered with different delays (to make
    // visually nice and 'natural' looking transitions), so we need to know
    // that both of them are finished.
    this.impress.css(this.root, {
        // to keep the perspective look similar for different scales
        // we need to 'scale' the perspective, too
        transform: this.impress.perspective( this.config.perspective / targetScale ) + this.impress.scale( targetScale ),
        transitionDuration: duration + "ms",
        transitionDelay: (zoomin ? delay : 0) + "ms"
    });

    this.impress.css(this.canvas, {
        transform: this.impress.rotate(target.rotate, true) + this.impress.translate(target.translate),
        transitionDuration: duration + "ms",
        transitionDelay: (zoomin ? 0 : delay) + "ms"
    });

    // Here is a tricky part...
    //
    // If there is no change in scale or no change in rotation and translation, it means there was actually
    // no delay - because there was no transition on `this.root` or `this.canvas` elements.
    // We want to trigger `impress:stepenter` event in the correct moment, so here we compare the current
    // and target values to check if delay should be taken into account.
    //
    // I know that this `if` statement looks scary, but it's pretty simple when you know what is going on
    // - it's simply comparing all the values.
    if ( this.currentState.scale === target.scale ||
        (this.currentState.rotate.x === target.rotate.x && this.currentState.rotate.y === target.rotate.y &&
         this.currentState.rotate.z === target.rotate.z && this.currentState.translate.x === target.translate.x &&
         this.currentState.translate.y === target.translate.y && this.currentState.translate.z === target.translate.z) ) {
        delay = 0;
    }

    // store current state
    this.currentState = target;
    this.activeStep = el;

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
    window.clearTimeout(this.stepEnterTimeout);
    this.stepEnterTimeout = window.setTimeout(function() {
        this.onStepEnter(this.activeStep);
    }.bind(this), duration + delay);

    return el;
};

// `prev` API function goes to previous step (in document order)
controller.prototype.prev = function () {
    var prev = this.steps.indexOf( this.activeStep ) - 1;
    prev = prev >= 0 ? this.steps[ prev ] : this.steps[ this.steps.length-1 ];

    return this.goto(prev);
};

// `next` API function goes to next step (in document order)
controller.prototype.next = function () {
    var next = this.steps.indexOf( this.activeStep ) + 1;
    next = next < this.steps.length ? this.steps[ next ] : this.steps[ 0 ];

    return this.goto(next);
};

module.exports = controller;
