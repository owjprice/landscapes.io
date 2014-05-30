'use strict';

angular.module('landscapesApp')
    .controller('LandscapeEditCtrl',
    function ($scope,
              $upload,
              $filter,
              $location,
              $routeParams,
              ValidationService,
              LandscapeService) {

        $scope.toggleUploadNewImage = function() {
            $scope.showUploadNewImage = !$scope.showUploadNewImage;
            $scope.imageError = false;
        };

        $scope.showUploadNewImage = false;
        $scope.showUploadNewTemplate = false;

        $scope.incrementVersion = function() {
            $scope.landscape.version = (Number($scope.landscape.version) + 0.1).toFixed(1);
            $scope.form.$dirty = true;
        };

        $scope.deleteLandscape = function(){
            LandscapeService.delete($routeParams.id)
                .then(function(data) {
                    console.log(data)
                    // show modal?
                    $location.path('/');
                })
                .catch(function(err) {
                    err = err.data;
                    console.log(err)
                });

        };

        LandscapeService.retrieve($routeParams.id)
            .then(function(landscape) {
                $scope.landscape = landscape;
                $scope.template = JSON.parse($scope.landscape.cloudFormationTemplate);
            })
            .catch(function(err) {
                err = err.data;
                console.log(err)
            });

        $scope.updateLandscape = function(form) {
            $scope.submitted = true;

            console.log($scope.landscape.cloudFormationTemplate);
            // validate cloudFormationTemplate here?

            if ($scope.landscape.cloudFormationTemplate === undefined || $scope.templateSelected === false) {
                console.log($scope.templateSelected)
                form.$valid = false;
            }

            if(form.$valid) {
                LandscapeService.update($routeParams.id, {
                    name: $scope.landscape.name,
                    version: $scope.landscape.version,
                    imageUri: $scope.landscape.imageUri,
                    cloudFormationTemplate: $scope.landscape.cloudFormationTemplate,
                    infoLink: $scope.landscape.infoLink,
                    infoLinkText: $scope.landscape.infoLinkText,
                    description: $scope.landscape.description
                })
                    .then( function() {
                        $location.path('/landscapes/' + $routeParams.id)
                    })
                    .catch( function(err) {
                        err = err.data;
                        console.log(err);

                        $scope.errors = {};

                        // Update validity of form fields that match the mongoose errors
                        angular.forEach(err.errors, function(error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.message;
                        });
                    });
            } else {
                console.log(JSON.stringify(form.$error));
            }
        };

        $scope.readFile = function() {
            console.log('readFile()');
        }

        $scope.onFileSelect = function($files) {
            console.log('onFileSelect()');
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/api/upload/template',
                    method: 'POST',
                    withCredentials: true,
                    data: {myObj: $scope.myModelObj},
                    file: file
                })
                    .success(function (data, status, headers, config) {
                        $scope.landscape.cloudFormationTemplate = $filter('json')(data);
                        $scope.templateSelected = true;
                    })
                    .error(function(err){
                        console.log(err);
                    });
                //.then(success, error, progress);
                //.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
            }
        };

        $scope.onImageSelect = function($files) {
            $scope.imageError = false;

//            var imageFileExtensions = ['png','jpg','jpeg'];
//            if(imageFileExtensions.indexOf(f.file.extension) === -1){
//                res.send(f.file.extension + ' is not a supported image format.'), 400
//            }

            console.log('onImageSelect()');
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/api/upload/image',
                    method: 'POST',
                    withCredentials: true,
                    data: {myObj: $scope.myModelObj},
                    file: file
                })
                    .success(function (data, status, headers, config) {
                        data = JSON.parse($filter('json')(data));
                        $scope.landscape.imageUri = data.imageUri;
                        $scope.imageSelected = true;
                        $scope.showUploadNewImage = false;
                        $scope.form.$dirty = true;
                    })
                    .error(function(err, status, headers){
                        if(status == 400) {
                            $scope.imageError = err;
                            console.log(err);
                        }
                    });
            }
        }

    }
);