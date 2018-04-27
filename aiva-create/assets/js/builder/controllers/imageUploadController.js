angular.module('builder.inspector').controller('ImageUploadController', function($scope, $compile, $rootScope, $http, aivaElementConfig, elementScaling, aivaVariant, draggable) {
    $scope.modal = $('#images-modal');
    $scope.selectedImage;
    $scope.downloadLocally = true;
    
    $scope.useUploadedImage = function() {
        var path = 'assets/images/uploads/' + $scope.selectedImage['file_name'];
        if ($scope.selectedImage['file_name'] != undefined) {
            $scope.generateImage(path);
        }
    }
    
    $scope.useLinkedImage = function() {
        if ($scope.webImageUrl != undefined && $scope.webImageUrl != "") {
            if ($scope.downloadLocally) {
                $http.post('images/', { url: $scope.webImageUrl }).success(function(data) {
                    $scope.generateImage(data);
                });
            } else {
                $scope.generateImage($scope.webImageUrl);
            }
        }
        
        $scope.modal.modal('hide');
    }
    
    
    $scope.generateImage = function(path) {
        var elementId = 'image-' + new Date().getTime();
        var imageConfig = aivaElementConfig.getConfig('image');
        var template = format(imageConfig.template, path, elementId);
        var compiledElem = $compile(template)($rootScope);        

        var isMobile = ($rootScope.activeCanvasSize === 'sm');
        var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

        var activeCta = $rootScope.frameBody.children('.' + selectedVariantClass);
        var activeCtaForm = activeCta.children('form');

        if (activeCtaForm.length > 0) { //form exists so append to it
            activeCtaForm.append(compiledElem);
        } else {
            //append to body then wrap all aiva elements with form 
            activeCta.append(compiledElem);

            var formElementConfig = aivaElementConfig.getConfig('aivaForm');
            var formElement = format(formElementConfig.template, 'cta.php');
            activeCta.find('aiva-elem').wrapAll(formElement);
        }

        $scope.modal.modal('hide');

        //finish method...todo: move to common service
        var ctaContainers = $rootScope.frameBody.find('.cta');
        
        //re-enable dragging and click events
        _.forEach(ctaContainers.find('.aiva-elem'), function(childElement) {
            
            var aivaElem = $(childElement);

            draggable.enableDragging(aivaElem);
            
            aivaElem.css('pointer-events', '');
            aivaElem.css('cursor', '');
            
            if (aivaElem.hasClass(elementId)) { //for now, just scale so image will fit on smallest cta container
                var xsContainer = $rootScope.frameBody.find('.cta-sm');
                
                aivaElem.load(function() {
                    aivaElem.width(aivaElem[0].width / elementScaling.scaleImage(aivaElem, xsContainer));
                    aivaElem.height(aivaElem[0].height / elementScaling.scaleImage(aivaElem, xsContainer));
                });
            }
        });  

        //undoRedo
        var dataObj = {
            createdElement: compiledElem.clone()
        };

        undoRedo.addToUndo('createElement', selectedVariantClass, elementId, dataObj);

        ctaContainers.css('cursor', 'auto');
        
    };
});


