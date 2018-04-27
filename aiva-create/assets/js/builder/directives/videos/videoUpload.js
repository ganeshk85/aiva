(function() {
    'use strict'

    angular.module('builder.inspector').directive("videoUpload", ['$upload', videoUpload]);
    
    function videoUpload($upload) {
        return {
            restrict: 'E',
            templateUrl: 'views/builder/videoUpload.html',
            controller: function($scope) {
                $scope.activeTab = 'upload';
                $scope.selectedFolder = { name: 'All Videos' };

                $scope.onFileSelect = function($files) {
                    if ($files.length > 0) {

                        $scope.upload = $upload.upload({
                            url: 'videos/',
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