var angular = require('angular');

var controller = function($scope, $sce) {

  this.scope = $scope;

  this.scope.message = $sce.trustAsHtml('My name is Dustin.<br/> Here are a few reasons why you should hire me.');

};
controller.$inject = ['$scope', '$sce'];

controller.prototype.doSomething = function() {
  console.log('test controller did something!')
};

module.exports = controller;
