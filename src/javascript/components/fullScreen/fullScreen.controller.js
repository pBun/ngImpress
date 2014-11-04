var angular = require('angular');

var controller = function() {

};

controller.prototype.getUpdatedStyles = function(eleRatio, wrapperWidth, wrapperHeight, offsetTop, offsetBottom, offsetLeft, offsetRight) {

  var wrapperRatio = wrapperWidth / wrapperHeight;

  // set the element's height/width to match the wrapper and then pos it in the top/left
  var newEleWidth = wrapperWidth;
  var newEleHeight = wrapperHeight;
  var newEleTop = 0 + offsetTop;
  var newEleLeft = 0 + offsetLeft;

  // if element is wider than window, match the height and then horizontally center
  if (wrapperRatio < eleRatio) {
    newEleWidth = wrapperHeight * eleRatio;
    newEleLeft = (-(newEleWidth - wrapperWidth) / 2) + offsetLeft;

  // if element is taller than window, match the width and then horizontally center
  } else if (wrapperRatio > eleRatio) {
    newEleHeight = wrapperWidth / eleRatio;
    newEleTop = (-(newEleHeight - wrapperHeight) / 2) + offsetTop;
  }

  return {
    'top': newEleTop,
    'left': newEleLeft,
    'width': newEleWidth,
    'height': newEleHeight
  };

};

module.exports = controller;
