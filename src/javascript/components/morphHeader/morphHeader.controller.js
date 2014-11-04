var angular = require('angular');

var controller = function($scope) {

  this.scope = $scope;

  this.scope.morphedStyles = {};

};
controller.$inject = ['$scope'];

controller.prototype.updateState = function() {
  if (!this.scope.states || !this.scope.states[this.scope.currentState]) {
    return;
  }
  this.scope.morphedStyles = this.scope.states[this.scope.currentState];
};

module.exports = controller;
