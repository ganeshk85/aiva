angular.module('builder.directives').directive('blPrettySelect', ['$parse', '$rootScope', function($parse, $rootScope) {

    //extend jquery ui widget so we can use different
    //styles for every select option
    $.widget('builder.prettyselect', $.ui.selectmenu, {
        _renderItem: function(ul, item) {
            var li = $('<li>', {text: item.label});

            li.css('font-family', item.element.attr('data-css'));

            return li.appendTo(ul);
        }
    });

    return {
        restrict: 'A',
        link: function($scope, el, attrs) {

            console.log( "builder.prettyselect: linked");

            //initiate select plugin on element
            el.prettyselect({
                width: attrs.width ? attrs.width : 70,
                appendTo: attrs.appendTo ? attrs.appendTo : $rootScope.inspectorCont
            });

            //hide select menu on inspector scroll
            $scope.inspectorCont.on('scroll', function() {
                el.prettyselect('close');
            });

            //get object reference to bind select value to
            var model = $parse(attrs.blPrettySelect);

            //assign new value to object on the scope we got above
            el.on('prettyselectchange', function(e, ui) {
                $scope.$apply(function() {
                    model.assign($scope, ui.item.element.attr('data-css'));
                    $scope.$emit('fontFamily.changed');
                });
            });

            //set up two way binding between select and model we got above
            $scope.$watch(attrs.blPrettySelect, function(elVal) {
                elVal = elVal.replace(/"/g, '');

                if ( ! elVal) { return true; };

                for (var i = el.get(0).options.length - 1; i >= 0; i--) {
                    var option = $(el.get(0).options[i]);
                    
                    var selVal = option.attr('data-css');
                    selVal = selVal.split(',')[0];

                    if (selVal && (selVal == elVal || selVal.match(new RegExp('^.*?'+elVal+'.*?$')))) {
                        return el.val(selVal).prettyselect('refresh');
                    }
                }
            });
        }
    }
}]);
