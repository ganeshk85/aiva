(function() {
    'use strict';
    
    angular.module('builder.styling', []).directive('blFontsPagination', fontsPagination);
    
    fontsPagination.$inject = ['fonts'];
    
    function fontsPagination(fonts) {
        return {
            restrict: 'A',  
            link: function($scope, el, attrs) {

                //initiate pagination plugin
                el.pagination({
                    items: 0,
                    itemsOnPage: fonts.paginator.perPage,
                    cssStyle: 'dark-theme',
                    onPageClick: function(num) {
                        $scope.$apply(function() {
                            fonts.paginator.selectPage(num);
                        })
                    },
                    onInit: function(a) {
                        $('.pagi-container > .simple-pagination').on('click', function(e) {
                            e.preventDefault();
                        });
                    }
                });

                //redraw pagination bar on total items change
                $scope.$watch('fonts.paginator.totalItems', function(value) {
                    if (value) { el.pagination('updateItems', value) }
                });	    
            }
        }
    }
    
}());