var angular = require('angular');

var controller = function($scope, $sce) {

  this.scope = $scope;

};
controller.$inject = ['$scope', '$sce'];

module.exports = controller;
