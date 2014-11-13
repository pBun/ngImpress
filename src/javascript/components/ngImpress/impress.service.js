var angular = require('angular');

var service = function($window, $document) {

  this.window = $window;
  this.document = $document[0];

  // This is where the root elements of all impress.js instances will be kept.
  // Yes, this means you can have more than one instance on a page, but I'm not
  // sure if it makes any sense in practice ;)
  this.roots = {};

  // some default config values.
  this.defaults = {
    width: 1024,
    height: 768,
    maxScale: 1,
    minScale: 0,

    perspective: 1000,

    transitionDuration: 1000
  };

  this.checkSupport();

};
service.$inject = ['$window', '$document'];

service.prototype.checkSupport = function() {
  var body = this.document.body;

  var ua = this.window.navigator.userAgent.toLowerCase();
  var impressSupported =
    // browser should support CSS 3D transtorms
    (this.pfx("perspective") !== null) &&

    // and `classList` and `dataset` APIs
    (body.classList) &&
    (body.dataset) &&

    // but some mobile devices need to be blacklisted,
    // because their CSS 3D support or hardware is not
    // good enough to run impress.js properly, sorry...
    (ua.search(/(iphone)|(ipod)|(android)/) === -1);

  return impressSupported;
};

// `pfx` is a function that takes a standard CSS property name as a parameter
// and returns it's prefixed version valid for current browser it runs in.
// The code is heavily inspired by Modernizr http://www.modernizr.com/
service.prototype.pfx = (function() {

  var style = document.createElement('dummy').style,
    prefixes = 'Webkit Moz O ms Khtml'.split(' '),
    memory = {};

  return function(prop) {
    if (typeof memory[prop] === "undefined") {

      var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
        props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

      memory[prop] = null;
      for (var i in props) {
        if (style[props[i]] !== undefined) {
          memory[prop] = props[i];
          break;
        }
      }

    }

    return memory[prop];
  };

})();

// `arraify` takes an array-like object and turns it into real Array
// to make all the Array.prototype goodness available.
service.prototype.arrayify = function(a) {
  return [].slice.call(a);
};

// `css` function applies the styles given in `props` object to the element
// given as `el`. It runs all property names through `pfx` function to make
// sure proper prefixed version of the property is used.
service.prototype.css = function(el, props) {
  var key, pkey;
  for (key in props) {
    if (props.hasOwnProperty(key)) {
      pkey = this.pfx(key);
      if (pkey !== null) {
        el.style[pkey] = props[key];
      }
    }
  }
  return el;
};

// `$` returns first element for given CSS `selector` in the `context` of
// the given element or whole document.
service.prototype.$ = function(selector, context) {
  context = context || document;
  return context.querySelector(selector);
};

// `$$` return an array of elements for given CSS `selector` in the `context` of
// the given element or whole document.
service.prototype.$$ = function(selector, context) {
  context = context || document;
  return this.arrayify(context.querySelectorAll(selector));
};

// `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
// and triggers it on element given as `el`.
service.prototype.triggerEvent = function(el, eventName, detail) {
  var event = document.createEvent("CustomEvent");
  event.initCustomEvent(eventName, true, true, detail);
  el.dispatchEvent(event);
};

// `translate` builds a translate transform string for given data.
service.prototype.translate = function(t) {
  return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
};

// `rotate` builds a rotate transform string for given data.
// By default the rotations are in X Y Z order that can be reverted by passing `true`
// as second parameter.
service.prototype.rotate = function(r, revert) {
  var rX = " rotateX(" + r.x + "deg) ",
    rY = " rotateY(" + r.y + "deg) ",
    rZ = " rotateZ(" + r.z + "deg) ";

  return revert ? rZ + rY + rX : rX + rY + rZ;
};

// `scale` builds a scale transform string for given data.
service.prototype.scale = function(s) {
  return " scale(" + s + ") ";
};

// `perspective` builds a perspective transform string for given data.
service.prototype.perspective = function(p) {
  return " perspective(" + p + "px) ";
};

// `getElementFromHash` returns an element located by id from hash part of
// window location.
service.prototype.getHash = function() {
  // get id from url # by removing `#` or `#/` from the beginning,
  // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
  return window.location.hash.replace(/^#\/?/, "");
};

// `computeWindowScale` counts the scale factor between window size and size
// defined for the presentation in the config.
service.prototype.computeWindowScale = function(config) {
  var hScale = window.innerHeight / config.height,
    wScale = window.innerWidth / config.width,
    scale = hScale > wScale ? wScale : hScale;

  if (config.maxScale && scale > config.maxScale) {
    scale = config.maxScale;
  }

  if (config.minScale && scale < config.minScale) {
    scale = config.minScale;
  }

  return scale;
};

// throttling function calls, by Remy Sharp
// http://remysharp.com/2010/07/21/throttling-function-calls/
service.prototype.throttle = function(fn, delay) {
  var timer = null;
  return function() {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
};

module.exports = service;
