(function() {
    'use strict'

    angular.module('builder.inspector').directive("imageUpload", ['$upload', imageUpload]);
    
    function imageUpload($upload) {
        return {
            restrict: 'E',
            templateUrl: 'views/builder/imageUpload.html',
            controller: function($scope, $element) {
                $scope.activeTab = 'upload';
                $scope.selectedFolder = { name: 'All Images' };

                $element.find('input.form-control').bind('keydown keypress', function(e) {
                    if (e.which === 46 || e.which === 8 || e.which === 13) {
                       e.stopPropagation();
                    }
                });
                $scope.onFileSelect = function($files) {
                    if ($files.length > 0) {

                        $scope.upload = $upload.upload({
                            url: 'images/',
                            data: false,
                            file: $files[0]
                        }).success(function(data) {
                            $scope.selectedImage = data[0];
                            $scope.useUploadedImage();
                        });
                    }
                }
            }
        };
    }
    
})();