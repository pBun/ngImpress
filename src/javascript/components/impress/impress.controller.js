var angular = require('angular');

var controller = function($scope) {

  this.scope = $scope;

};
controller.$inject = ['$scope'];

controller.prototype.updateState = function() {

};

module.exports = controller;
