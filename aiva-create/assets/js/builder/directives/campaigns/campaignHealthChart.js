
angular.module('builder').directive('campaignHealthChart', function () {
    return {
        restrict: 'A',
        scope : {
            data: '='
        },
        templateUrl: 'views/campaigns/health.html',
        link: function ( $scope, $element ) {
            
            $element.css( {
                width: '100px',
                height: '30px'
            });
            // <img src="assets/images/campaigns/pulse.png" alt="score chart...." style="width: 80px;" />

            var canvas = document.createElement("canvas");
            canvas.id = "ctx" + parseInt( Math.random()*10000, 10 );
            canvas.style.border = "none";
            canvas.width = 100;
            canvas.height = 30;
            
            var padding = 5;
            var totalDays = 7;

            var ctx = canvas.getContext('2d');
            
            $scope.getRatio = function (record) {
                if ( typeof record.success === 'undefined') return 0;
                return record.total === 0 ? 0 : (100 * record.success / record.total).toFixed(2);
            };

            $scope.refresh = function() {
                var data;
                if ( $scope.data ) {
                    $element.find('.wrap').addClass('campaign-health-check');
                    data = angular.copy( $scope.data );
                } else {
                    data = [{}, {}, {}, {}, {}, {}, {}];
                }
                ctx.clearRect(0, 0, canvas.width - 1, canvas.height - 1);
                ctx.lineWidth = 1;
                // console.warn( $scope.data );
                $element.addClass('with-data');
                
                // first loop: define minY and maxY
                var minY, maxY, arrDt = [], arrValues = [];
                for ( var day = 0; day < totalDays; day ++ ) {
                    var record = data[day];
                    var val = 0;
                    if (record && record.dt) {
                        // console.warn( record );
                        // var dt = moment().add( - day, 'd').format("YYYY-MM-DD");
                        if ( typeof record !== 'undefined' ) {
                            val = $scope.getRatio(record);
                            if ( typeof minY === 'undefined' || minY > val ) { minY = parseInt( val, 10); }
                            if ( typeof maxY === 'undefined' || maxY < val ) { maxY = parseInt( val, 10); }
                            arrDt.push( record.dt );
                        } else {
                            minY = 0;
                            if ( typeof maxY === 'undefined' ) { maxY = 0; }
                            arrDt.push( '' );
                        }
                    }
                    arrValues.push( parseInt( val, 10) );
                }
                
                var dx = (canvas.width - padding * 2) / (totalDays - 1);
                var dy = - ( canvas.height - padding * 2 ) / 100;
                //  console.log( 'minY=', minY, 'maxY=', maxY, 'dx=', dx, 'dy=', dy, arrValues );
                
                var arrX = [], arrY = [], arrC = [];
                for ( var day = 0; day < totalDays; day ++ ) {
                    var value = arrValues[ day ];
                    // arrC.push( ( value ) ? '#1ab644' : '#aaa' );
                    
                    arrC.push('#1ab644');
                    var x = padding + day * dx;
                    var y = canvas.height - padding + value * dy;
                    arrX.push( x );
                    arrY.push( y );
                }
                // connecting dots
                for ( var day = 1; day < totalDays; day ++ ) {
                    ctx.strokeStyle = arrC[ day - 1 ];
                    
                    ctx.beginPath();
                    ctx.moveTo( arrX[day-1], arrY[day-1] );
                    ctx.lineTo( arrX[day], arrY[day] );
                    ctx.stroke();
                }
                for ( var day = 0; day < totalDays; day ++ ) {
                    ctx.strokeStyle = arrC[ day ];
                    ctx.fillStyle = arrC[ day ];
                    var radius = ( day === 0 || day === (totalDays - 1) ) ? 3 : 0;
                    if (radius > 0) {
                        ctx.beginPath();
                        ctx.arc(arrX[day], arrY[day], radius, 0, Math.PI*2, true); // circle
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            };
            $element.find( '.wrap' ).append( canvas );
            $scope.$watch('data', $scope.refresh );
           
        }
    };
});