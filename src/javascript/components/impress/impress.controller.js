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

  // configuration options
  this.scope.config = null;

  // scale factor of the browser window
  this.scope.windowScale = null;

  // root presentation elements
  this.scope.canvas = document.createElement("div");

  this.scope.initialized = false;

  // reference to last entered step
  this.scope.lastEntered = null;

};
controller.$inject = ['$scope', 'Impress'];

controller.prototype.updateState = function() {

};

module.exports = controller;
