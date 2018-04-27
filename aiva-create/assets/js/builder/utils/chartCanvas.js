var Debounced = {
    queue: {},
    start : function ( id, callback, ms ) {
        if ( typeof( callback ) !== 'function' ) { throw "Debounced.start: invalid arguments, at least callback expected"; }
        if ( typeof( ms ) === "undefined" ) { ms = 500; }
        var timeoutid = Debounced.queue[ id ];
        clearTimeout(timeoutid);
        Debounced.queue[ id ] = setTimeout( function() { callback(); delete Debounced.queue[id]; }, ms );
    }
};

function getCurvePoints (pts, tension, isClosed, numOfSegments) {

    // use input value if provided, or use a default value
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [],    // clone array
        x, y,           // our x,y coords
        t1x, t2x, t1y, t2y, // tension vectors
        c1, c2, c3, c4,     // cardinal points
        st, t, i;       // steps based on num. of segments

    // clone array so we don't change the original
    //
    _pts = pts.slice(0);

    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to befinning, end points to end
    if (isClosed) {
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.push(pts[0]);
        _pts.push(pts[1]);
    }
    else {
        _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
        _pts.unshift(pts[0]);
        _pts.push(pts[pts.length - 2]); //copy last point and append
        _pts.push(pts[pts.length - 1]);
    }

    // ok, lets start..

    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for (i=2; i < (_pts.length - 4); i+=2) {
        for (t=0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i+2] - _pts[i-2]) * tension;
            t2x = (_pts[i+4] - _pts[i]) * tension;

            t1y = (_pts[i+3] - _pts[i-1]) * tension;
            t2y = (_pts[i+5] - _pts[i+1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1;
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
            c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st;
            c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }
    return res;
}


var ChartsCanvas = function( elemParent, options  ) {

    var me = this;
    this.o = {
        style: "lines",
        aspectRatio: 700 / 180,

        labelLeft: "",
        labelBottom: "",

        spaceLeft: 35,
        spaceRight: 10,
        spaceBottom: 20,
        spaceTop: 10,

        minValueY : 0,
        maxValueY : 100,
        stepsValueY : 10,

        minValueX : 0,
        maxValueX : 1,
        stepsValueX : 1,

        values: {},
        names: [],
        series: [],
        colors: [],
        shapes: [],

        niceDateValue: function(iso) { 
            if ( !iso) return '';
            if ( typeof iso !== 'string' ) return iso;
            if ( iso.indexOf('-') === -1 ) return iso;
            return moment(iso).format( "MM/DD/YY");
        },
        niceTextValueX: function( x  ) { return x; },
        niceTextValueY: function( x  ) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '%'; }
    };
    this.setOptions = function (o) {
        if (typeof( o ) !== 'undefined') {
            for (var k in o) {
                me.o[k] = o[k];
            }
        }
    };
    this.setOptions( options );

    var container = document.createElement('div');
    container.className = 'chart-container';
    elemParent.append(container);

    var canvas = document.createElement("canvas");
    canvas.id = "ctx" + parseInt( Math.random()*10000, 10 );
    canvas.style.border   = "none";
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetWidth / me.o.aspectRatio;
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // console.debug( [ "canvas created", canvas.id, canvas.width, container.offsetWidth, canvas.height ] );
    container.appendChild( canvas );

    this.setAxisStyle = function() {
        me.ctx.lineWidth = 1;
        me.ctx.fillStyle = me.ctx.strokeStyle = '#717376'; // '#717376';
        me.ctx.font = "10px Roboto";
    };

    this.mouse = {
        pointer: {
            x : -1, y: -1
        },
        over: function( e ) {
            // console.log( "canvas: mouse over" );

        },
        move: function( evt ) {
            var rect = me.canvas.getBoundingClientRect();

            var nEffectiveScreenWidth = me.canvas.width - me.o.spaceLeft - me.o.spaceRight;
            var index = 0, x = me.o.minValueX, dx = nEffectiveScreenWidth / ( me.o.maxValueX - me.o.minValueX );

            var minDivision = 1;
//            if ( dx < 4 ) { minDivision = 8; }
//            else if ( dx < 10 ) { minDivision = 4; }
//            else if ( dx < 20 ) { minDivision = 2; }

            var prevPointer = angular.copy( me.mouse.pointer );
            me.mouse.pointer.y = evt.clientY - rect.top;
            var exactMouseX = evt.clientX - rect.left; // -  me.o.spaceLeft

            while( x <= me.o.maxValueX ) {
                if ( index % minDivision === 0 ) {
                    var screenX = dx * (x - me.o.minValueX);
                    if ( exactMouseX + (dx / 2) >= screenX + me.o.spaceLeft ) {
                        // console.log( ["exactMouseX", exactMouseX, "screenX", screenX, "x", x, "index", index ] );
                        me.mouse.pointer.x = screenX + me.o.spaceLeft ;
                        me.mouse.pointer.xValue = x;
                    }
                }
                x += me.o.stepsValueX; index ++;
            }

            if ( prevPointer.x != me.mouse.pointer.x || prevPointer.y != me.mouse.pointer.y ) {
                me.render();
            }
        },
        out: function( e ) {
            me.mouse.pointer = { x: -1, y: -1 };
            me.render();
        }
    };

    canvas.onmouseover = this.mouse.over;
    canvas.onmousemove = this.mouse.move;
    canvas.onmouseout = this.mouse.out;

    this.renderAxisX = function() {
        // console.info( "renderAxisX()", me.o.series);
        if (!me.o.series || !me.o.series.length) return;

        var screenY = me.canvas.height - me.o.spaceBottom;
        me.setAxisStyle();
        me.ctx.textBaseline = "top";
        me.ctx.textAlign = "center";

        me.ctx.beginPath();
        me.ctx.moveTo( me.o.spaceLeft, screenY );
        me.ctx.lineTo( me.canvas.width - me.o.spaceRight, screenY );
        me.ctx.stroke();

        var nEffectiveScreenWidth = me.canvas.width - me.o.spaceLeft - me.o.spaceRight;
        var index = 0, x = me.o.minValueX, dx = nEffectiveScreenWidth / ( me.o.maxValueX - me.o.minValueX );

        var minDivision = 1; // show every date
        if ( dx < 30 ) { minDivision = 4; } // show every 4th date
        else if ( dx < 60 ) { minDivision = 2; } // show every second date

        // console.info ( [ "effective screen width", nEffectiveScreenWidth, "dx", dx, "minDivision", minDivision ] );
        while( x <= me.o.maxValueX ) {
            if ( index % minDivision === 0 ) {
                var screenX = me.o.spaceLeft + dx * (x - me.o.minValueX);
//                me.ctx.beginPath();
//                me.ctx.moveTo(screenX, screenY);
//                me.ctx.lineTo(screenX, screenY + 5);
//                me.ctx.stroke();

                var val = me.o.niceDateValue( me.o.series[0][index] );
                // var val = x + ' vs ' + me.o.maxValueX;
                if (x === me.o.minValueX) {
                    screenX += me.o.spaceLeft / 2;
                } else if (x === me.o.maxValueX) {
                    screenX -= me.o.spaceLeft / 2;
                }
                me.ctx.fillText( val, screenX, screenY + 5);
            }
            x += me.o.stepsValueX; index ++;
        }
    };

    this.renderAxisY = function() {
        // console.info( "renderAxisY()");
        me.setAxisStyle();
        me.ctx.textBaseline = "middle";
        me.ctx.textAlign = "right";
//
//        me.ctx.beginPath();
//        me.ctx.moveTo( me.o.spaceLeft, me.canvas.height - me.o.spaceBottom );
//        me.ctx.lineTo( me.o.spaceLeft, 0 );
//        me.ctx.stroke();

        var nEffectiveScreenHeight = me.canvas.height - me.o.spaceTop - me.o.spaceBottom;
        var index = 0, y = me.o.minValueY, dy = 1.0 * nEffectiveScreenHeight / ( me.o.maxValueY - me.o.minValueY );

        var minDivision = 1;
        if ( dy*me.o.stepsValueY < 30 ) { minDivision = 2; }
        else if ( dy*me.o.stepsValueY < 15 ) { minDivision = 4; }
        //if ( dy*me.o.stepsValueY < 4 ) { minDivision = 8; }
       
        // console.info ( [ "effective screen height", nEffectiveScreenHeight, "dy", dy, "minDivision",  dy*me.o.stepsValueY  ] );
        me.ctx.strokeStyle = '#cccccc';
        me.ctx.lineWidth = 1;
                
        while( y <= me.o.maxValueY ) {
            if ( index % minDivision === 0 ) {
                var screenY = me.canvas.height - me.o.spaceBottom - dy * (y - me.o.minValueY);
                // console.warn( [ index, screenY ] );

                me.ctx.beginPath();
                me.ctx.moveTo( me.o.spaceLeft, screenY );
                me.ctx.lineTo( me.canvas.width - me.o.spaceRight, screenY );
                me.ctx.stroke();

                me.ctx.fillText( me.o.niceTextValueY( y ), -8 + me.o.spaceLeft, screenY);
            }
            y += me.o.stepsValueY; index ++;
        }
        
    };

    this.renderLabels = function() {
        me.ctx.fillStyle = me.ctx.strokeStyle = '#000000'; //'#717376';

        me.ctx.font = "16px arial";
        if ( me.canvas.width < 400 ) {
            me.ctx.font = "bold 12px arial";
        }
        if ( me.canvas.width < 300 ) {
            me.ctx.font = "bold 10px arial";
        }
        me.ctx.lineWidth = 1;

        if ( me.o.labelLeft ) {
            me.ctx.textBaseline = "top";
            me.ctx.textAlign  = "center";
            me.ctx.save();
            me.ctx.translate( 0, me.canvas.height / 2);
            me.ctx.rotate(-Math.PI/2);
            me.ctx.fillText( me.o.labelLeft, 0, 0 );
            me.ctx.restore();
        }

        if ( me.o.labelBottom ) {
            me.ctx.textBaseline = "bottom";
            me.ctx.textAlign  = "center";
            me.ctx.fillText( me.o.labelBottom, me.canvas.width / 2, me.canvas.height );
        }
        // console.log([ "renderLables", me.o.labelLeft, me.o.labelBottom ] );
    };

    this.drawLinearCurve = function( points, color ) {
        me.ctx.lineWidth = 2;
        // console.warn( points );
        if ( points.length > 1 ) {
            me.ctx.fillStyle = me.ctx.strokeStyle = color;
            me.ctx.beginPath();
            me.ctx.moveTo(points[0].x, points[0].y);
            for (i = 1; i < points.length; i++) {
                me.ctx.lineTo(points[i].x, points[i].y);
            }
            me.ctx.stroke();
        }
    };

    this.drawPoint = function( x, y, shape ) {

        var radius = 5;
        if ( me.canvas.width < 600 ) { radius = 4; }
        if ( me.canvas.width < 400 ) { radius = 2; }
        if ( me.canvas.width < 300 ) { radius = 1; }


        switch (shape ) {
            case "circle":
                me.ctx.beginPath();
                me.ctx.arc(x, y, radius,0,Math.PI*2,true); // circle
                me.ctx.fill();
                break;
            case "bar":
                me.ctx.fillRect(x-radius, y-radius, radius*2, radius*2); // circle
                break;
            case "triangle":
                me.ctx.beginPath();
                me.ctx.moveTo( x - radius, y + radius ); // circle
                me.ctx.lineTo( x + radius, y + radius ); // circle
                me.ctx.lineTo( x, y - radius ); // circle
                me.ctx.fill();
                break;

        }

    };


    this.renderLine = function ( data, color, shape )
    {
        if ( !data) return;

        // 1st PASS:draw lines
        var nEffectiveScreenWidth = me.canvas.width - me.o.spaceLeft - me.o.spaceRight;
        var dx = nEffectiveScreenWidth / ( me.o.maxValueX - me.o.minValueX );
        var nEffectiveScreenHeight = me.canvas.height - me.o.spaceTop - me.o.spaceBottom;
        var dy = nEffectiveScreenHeight / ( me.o.maxValueY - me.o.minValueY );


        // console.warn( [ "fillStyle", me.ctx.fillStyle, JSON.stringify( data ) ] );
        var points = [];
        for ( var xi in data ) {
            var xValue = xi * me.o.stepsValueX;
            var yValue = data[ xi ];
            var screenX = me.o.spaceLeft + dx * (xValue - me.o.minValueX);
            var screenY = me.canvas.height - me.o.spaceBottom - dy * ( yValue - me.o.minValueY);
            points.push( { x : parseInt( screenX, 10 ), y: parseInt( screenY, 10) } );
        }
        me.drawLinearCurve( points, color );

        // 2nd PASS:draw points
        for ( var xi2 in data ) {
            var xValue2 = xi2 * me.o.stepsValueX;
            var yValue2 = data[ xi2 ];

            var screenX2 = me.o.spaceLeft + dx * (xValue2 - me.o.minValueX);
            var screenY2 = me.canvas.height - me.o.spaceBottom - dy * ( yValue2 - me.o.minValueY);
//             console.info( [ xValue2, yValue2, screenX2, screenY2 ] );
            this.drawPoint( screenX2, screenY2, shape );
            // me.ctx.stroke();
        }
    };

    this.renderBars = function ( series, colors ) {
        // 1st PASS:draw lines
        var nEffectiveScreenWidth = me.canvas.width - me.o.spaceLeft - me.o.spaceRight;
        var dx = nEffectiveScreenWidth / ( me.o.maxValueX - me.o.minValueX );
        var nEffectiveScreenHeight = me.canvas.height - me.o.spaceTop - me.o.spaceBottom;
        var dy = nEffectiveScreenHeight / ( me.o.maxValueY - me.o.minValueY );

        // Loop 1: buffering values
        var arrXShift = {}, arrRectangles = [], minX = me.o.maxValueX, maxX = me.o.minValueX;
        for (var si = 0; si < me.o.series.length; si++) {
            var data = me.o.series[ si ];
            for (var xi in data) {
                var xValue = xi * me.o.stepsValueX;
                var yValue = data[xi];
                if ( yValue - me.o.minValueY > 0 ) {
                    var screenX = dx * (xValue - me.o.minValueX);
                    if (typeof( arrXShift[xi] ) === 'undefined') {
                        arrXShift[xi] = 0;
                    }
                    arrRectangles.push({
                        x : screenX,
                        y: arrXShift[xi],
                        height: dy * ( yValue - me.o.minValueY),
                        color: me.o.colors[si]
                    });
                    arrXShift[xi] += dy * ( yValue - me.o.minValueY);
                }
            }
        }

        var divisions = parseInt( (me.o.maxValueX - me.o.minValueX) / me.o.stepsValueX, 10 );
        var sideWidth = parseInt( me.canvas.width * 0.2 / divisions, 10 );
        for ( var ri = 0; ri < arrRectangles.length; ri++ ) {
            var rect = arrRectangles[ ri ];

            me.ctx.fillStyle = me.ctx.strokeStyle = rect.color;
            me.ctx.fillRect(
                me.o.spaceLeft + rect.x - sideWidth,
                me.canvas.height - me.o.spaceBottom - rect.y - rect.height,
                2*sideWidth, rect.height ); // circle
        }

    };

    this.renderSeries = function() {
        if ( !me.o.values ) return;

        if ( me.o.style === "lines" ) {
            // console.log( [ "series", me.o.series, me.o.colors, me.o.shapes  ] );
            // for (var i = 0; i < me.o.series.length; i++) {
               //  this.renderLine(me.o.series[i], me.o.colors[i], me.o.shapes[i]);
            // }
            
            this.renderLine(me.o.values, me.o.colors[2], 'circle');
        } else if ( me.o.style === "bars") {
            this.renderBars(me.o.series, me.o.colors );
        }
    };

    this.renderPointerBackground = function() {

        if ( ! me.o.series ||
             typeof( me.o.series[0] ) === "undefined" ) return;

        if ( typeof( me.mouse.pointer.xValue )!== "undefined" &&
             me.mouse.pointer.x >= me.o.spaceLeft -1 &&
             me.mouse.pointer.y >= me.o.spaceTop - 1 &&
             me.mouse.pointer.x <= ( me.canvas.width - me.o.spaceRight + 1 ) &&
             me.mouse.pointer.y <= ( me.canvas.height - me.o.spaceBottom + 1 ) ) {

            me.ctx.save();
            me.ctx.strokeStyle = "#f9faf9";
            me.ctx.lineWidth = 10;
            me.ctx.beginPath();
            me.ctx.moveTo( me.mouse.pointer.x, me.o.spaceTop ); 
            me.ctx.lineTo( me.mouse.pointer.x, me.canvas.height - me.o.spaceBottom  ); 
            me.ctx.stroke();
            me.ctx.restore();
        }
    };


    this.renderPointer = function() {

        if ( ! me.o.series ||
             typeof( me.o.series[0] ) === "undefined" ) return;

        if ( typeof( me.mouse.pointer.xValue )!== "undefined" &&
             me.mouse.pointer.x >= me.o.spaceLeft -1 &&
             me.mouse.pointer.y >= me.o.spaceTop - 1 &&
             me.mouse.pointer.x <= ( me.canvas.width - me.o.spaceRight + 1 ) &&
             me.mouse.pointer.y <= ( me.canvas.height - me.o.spaceBottom + 1 ) ) {


            var nBoxPaddingX = 10, nBoxPaddingY = 5, nLineHeight = 18,
                nBoxWidth = 100, nBoxHeight = 2*nBoxPaddingY - 2;

            me.ctx.font = "bold 12px arial";
            me.ctx.textBaseline = "top";
            me.ctx.textAlign  = "left";

            // defining if text will extend the box
            for ( var j = 0 ; j < me.o.names.length ; j ++ ) {
                if ( typeof( me.o.series[j] ) !== "undefined" ) {
                    var val = me.o.series[j][ me.mouse.pointer.xValue ];
                    if ( me.o.names[ j ] === 'Date' ) {
                        val = me.o.niceDateValue( me.o.series[ j ][ me.mouse.pointer.xValue ]  );
                    }
                    if ( typeof val !== 'undefined' && ! isNaN(val)) {
                        nBoxHeight += nLineHeight;
                        var sLabel = me.o.names[ j ] + ": " + ( me.o.series[ j ][ me.mouse.pointer.xValue ] );
                        var nTextWidth = me.ctx.measureText( sLabel ).width;
                        if ( nTextWidth+2*nBoxPaddingX > nBoxWidth ) { nBoxWidth = nTextWidth+2*nBoxPaddingX; }
                    }

                }
            }

            var nBoxLeft = ( me.mouse.pointer.x < me.canvas.width / 2) ?
                me.mouse.pointer.x : me.mouse.pointer.x - nBoxWidth;
            var nBoxTop = ( me.mouse.pointer.y < me.canvas.height / 2) ?
                me.mouse.pointer.y : me.mouse.pointer.y - nBoxHeight;

            me.ctx.fillStyle = '#FCFCFC';
            me.ctx.strokeStyle = '#bdbdbd';
            me.ctx.fillRect( nBoxLeft, nBoxTop, nBoxWidth, nBoxHeight ); // circle
            me.ctx.strokeRect( nBoxLeft, nBoxTop, nBoxWidth, nBoxHeight ); // circle


            me.ctx.fillStyle = '#000000';
            var y = nBoxTop + nBoxPaddingY;
            // me.ctx.fillText( "Day: " + me.mouse.pointer.xValue, nBoxLeft + nBoxPaddingX, y );
            // y+= nLineHeight;
            for ( var i = 0 ; i < me.o.names.length ; i ++ ) {
                    
                if ( typeof( me.o.series[i] ) !== "undefined" ) {
                    var val = me.o.series[i][ me.mouse.pointer.xValue ];
                    if ( me.o.names[ i ] === 'Date' ) {
                        val = me.o.niceDateValue( me.o.series[ i ][ me.mouse.pointer.xValue ]  );
                    }
                    if (typeof val !== 'undefined' && !isNaN(val)) {
                        me.ctx.fillStyle = me.o.colors[ i ];
                        me.ctx.fillText(  me.o.names[ i ] + ": " + ( val ),
                             nBoxLeft + nBoxPaddingX, y );
                        y+= nLineHeight;
                    }
                }
            }


        }
    };




    this.render = function() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        if ( ! me.o.values ) return;

        me.renderPointerBackground();
        me.renderAxisX();
        me.renderAxisY();
        me.renderLabels();
        me.renderSeries();
        me.renderPointer();


    };

    this.refreshDimensions = function() {
        container.style.display = "none";
        var w = $(container).closest(".canvas").width();
        canvas.width = w;
        canvas.height = w / me.o.aspectRatio;
        container.style.display = "block";
        me.render();
    };

    window.addEventListener( "resize", function( e ) {
        Debounced.start( "resize", me.refreshDimensions, 100 );
    } );

    me.render();
    return this;
};
