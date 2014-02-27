'use strict';

angular.module('paestApp')
  .controller( 'MainCtrl', function (
    $log,$scope,$http,$rootScope,$location,$routeParams,$interval) {

    $scope.load = function(session){
      $scope.data = localStorage.getItem($scope.id+':data')
      session.setValue($scope.data);
      $http({
        url: 'http://a.pae.st/'+$scope.id,
        method: "GET",
      }).success(function(data, status, headers, config) {
        if (data != 'undefined'){
          $scope.data = data;
          session.setValue($scope.data);
          localStorage.setItem($scope.id+':data',$scope.data)
        }
        $log.log('load:',status)
      }).error(function(data, status, headers, config) {
        $log.error('load:',status)
      });
    }

    $scope.save = function(session) {
      var url = 'http://a.pae.st'
      if ($scope.id){
        localStorage.setItem($scope.id+':data',$scope.data)
        url += '/'+$scope.id
      }
      if ( $scope.key ) url += '/'+$scope.key
      $http({
        url: url,
        method: "POST",
        data: 'p='+$scope.data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(data, status, headers, config) {
        $log.log('save:',status)
        $scope.editUrl = data.split('\n')[2].split('#')[0]
        var id = $scope.editUrl.split('/')[3]
        if (id && id != $scope.id) {
          $scope.id = id;
          $location.path('/'+$scope.id)
        }
        var key  = $scope.editUrl.split('/')[3]
        if (key && key != $scope.key) {
          $scope.key = $scope.editUrl.split('/')[4]
          localStorage.setItem($scope.id+':key',$scope.key)
        }
      }).error(function(data, status, headers, config) {
        $log.error('save:',status)
      });
    }

    $scope.aceLoaded = function(editor){

      var StatusBar = ace.require('ace/ext/statusbar').StatusBar
      var statusBar =
        new StatusBar(editor, document.getElementById('status-bar'))
      var session = editor.getSession()

      if ($routeParams.id){
        $scope.id = $routeParams.id;
        $rootScope.id = $routeParams.id;
        $scope.key = localStorage.getItem($scope.id+':key')
        $scope.load(session)
      } else {
        $scope.save(session)
      }

      $scope.unsaved = false;
      session.on("change", function(e){
        $scope.data = session.getValue();
        $scope.unsaved = true;
      })

      $interval(function(){
        if ($scope.unsaved) {
          $scope.save(session);
        }
        $scope.unsaved = false;
      },2000)

    }

  });
