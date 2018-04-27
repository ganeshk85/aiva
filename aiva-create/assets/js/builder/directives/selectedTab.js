angular.module('builder.directives').directive('selectedTab', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="selected-tab">' + 
                    '<div class="before"></div>' + 
                    '<div class="tab"></div>' + 
                    '<div class="after"></div>' + 
                  '</div>',
        link: function($scope, el) {
            function setOffset(){
                var offsetTop = 26;

                var elem = document.querySelector(".main-nav .push-top")
                if (elem && elem.offsetParent !== null) {
                    offsetTop = 10;
                }

                $('.main-nav').on('click', '.nav-item', function(e) {
                    if ( ! e.currentTarget.hasAttribute('not-selectable')) {
                        var ny = e.currentTarget.getBoundingClientRect().top - offsetTop;
                        el.find(".before").css("height", (ny + 10) + 'px');
                        el.find(".tab").css('top', (ny) + 'px');
                        el.find(".after").css("top", (ny + 75) + 'px');
                    }
                });
            }
            // setOffset();
            $(window).on('resize', setOffset);
            setTimeout(function() {
                setOffset();
            }, 500 );
        }
    }
});