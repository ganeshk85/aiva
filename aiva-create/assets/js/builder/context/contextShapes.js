
angular.module('builder').factory('contextShapes', function() {
    
    var self = this;
    
    var canvas;
    var canvasScale = 1.0;
    var SCALE_FACTOR = 1.05;
    var shapeType = "Rectangle";
    var loaded = false;

    function zoomIn() {
        canvasScale = canvasScale * SCALE_FACTOR;
        canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
        canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);

        var objects = canvas.getObjects();
        var prevType = "";
        for (var i in objects) {
            if(prevType == "rect") {
                prevType = "";
                continue;
            }
            prevType = objects[i].type;
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * SCALE_FACTOR;
            var tempScaleY = scaleY * SCALE_FACTOR;
            var tempLeft = left * SCALE_FACTOR;
            var tempTop = top * SCALE_FACTOR;

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }


        canvas.renderAll();
    }

    function zoomOut (){
        canvasScale = canvasScale / SCALE_FACTOR;
        canvas.setHeight(canvas.getHeight() * (1 / SCALE_FACTOR));
        canvas.setWidth(canvas.getWidth() * (1 / SCALE_FACTOR));

        var objects = canvas.getObjects();
        var prevType = "";
        for (var i in objects) {
            if(prevType == "rect") {
                prevType = "";
                continue;
            }
            prevType = objects[i].type;
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * (1 / SCALE_FACTOR);
            var tempScaleY = scaleY * (1 / SCALE_FACTOR);
            var tempLeft = left * (1 / SCALE_FACTOR);
            var tempTop = top * (1 / SCALE_FACTOR);

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }

        canvas.renderAll();
    }	

    this.setShape = function(sh) {
        shapeType = sh;
    }

    function load() {
        canvas = self.__canvas = new fabric.Canvas('canvas', { selection: false });
        var line, isDown, startPosition={}, shape, drawingMode=true;

    function starPolygonPoints(spikeCount, outerRadius, innerRadius, outerRadiusY, innerRadiusY) {
      var rot = Math.PI / 2 * 3;
      var cx = outerRadius;
      var cy = outerRadiusY;
      var sweep = Math.PI / spikeCount;
      var points = [];
      var angle = -Math.PI / spikeCount / 2;

      for (var i = 0; i < spikeCount; i++) {
        var x = cx + Math.cos(angle) * outerRadius;
        var y = cy + Math.sin(angle) * outerRadiusY;
        points.push({x: x, y: y});
        angle += sweep;

        x = cx + Math.cos(angle) * innerRadius;
        y = cy + Math.sin(angle) * innerRadiusY;
        points.push({x: x, y: y});
        angle += sweep
      }
      return (points);
    }

    canvas.on('mouse:down', function(event){
        if (!drawingMode) return;
        isDown = true;
        var pointer = canvas.getPointer(event.e);
        startPosition.x=pointer.x;
        startPosition.y=pointer.y;

        console.log(startPosition);

        if (shapeType == "Select")
            return;
        if (shapeType == "Rectangle" || shapeType == "RoundRect" || shapeType == "Triangle") {
            if (shapeType == "Triangle") {
                shape=new fabric.Triangle({
                    left:startPosition.x,
                    top:startPosition.y,
                    width:1,
                    height:1,
                    stroke:'transparent',
                    strokeWidth:0,
                    fill:'lightpink'
                });
            } else {
                shape=new fabric.Rect({
                    left:startPosition.x,
                    top:startPosition.y,
                    width:0,
                    height:0,
                    stroke:'transparent',
                    strokeWidth:0,
                    fill:'lightpink'
                });
            }
        } else if (shapeType == "Rectangle1" || shapeType == "Rectangle2" || shapeType == "Rectangle3" || shapeType == "Star") {
            shape = new fabric.Polygon([{
                x: 0,
                y: 0
            }], {
                left: startPosition.x,
                top: startPosition.y,
                fill: 'lightpink',
                opacity: 0.5
            });
        } else if (shapeType == "Ellipse") {
            shape = new fabric.Circle({
                radius: 0, left: startPosition.x, top: startPosition.y, fill: 'lightpink'
            });
        }

        //shape.scaleX = canvasScale;
        //shape.scaleY = canvasScale;

        canvas.add(shape);
    });

    canvas.on('mouse:move', function(event){
        if (!isDown || !drawingMode) return;
        var pointer = canvas.getPointer(event.e);
        var xx = pointer.x > startPosition.x ? startPosition.x : pointer.x;
        var yy = pointer.y > startPosition.y ? startPosition.y : pointer.y;
        var ww = Math.abs( pointer.x-startPosition.x );
        var hh = Math.abs( pointer.y-startPosition.y );
        var mm = ww > hh ? hh : ww;
        if (shapeType == "Select")
            return;
        if (shapeType == "Rectangle" || shapeType == "RoundRect" || shapeType == "Triangle") {
            shape.setLeft(xx);
            shape.setTop(yy);
            shape.setWidth(ww);
            shape.setHeight(hh);
            if (shapeType == "RoundRect")
            {
                shape.rx = mm / 10;
                shape.ry = mm / 10;
            }
        } else if (shapeType == "Rectangle1" || shapeType == "Rectangle2" || shapeType == "Rectangle3" || shapeType == "Star") {
            shape.setLeft(xx);
            shape.setTop(yy);
            var points = [];//shape.get("points");
            if (shapeType == "Star") {
                points=starPolygonPoints(5,ww / 2,ww / 6, hh/2, hh/6);
            } else {
                if (shapeType == "Rectangle1")
                    points.push({x: 0, y: 0},{x: ww-mm/10, y: 0},{x: ww, y: mm/10},{x: ww, y: hh },{x: 0, y: hh});
                else if (shapeType == "Rectangle2")
                    points.push({x: mm/10, y: 0},{x: ww-mm/10, y: 0},{x: ww, y: mm/10},{x: ww, y: hh },{x: 0, y: hh},{x: 0, y: mm/10});
                else if (shapeType == "Rectangle3")
                    points.push({x: ww/2, y: 0},{x: ww, y: hh/2},{x: ww/2, y: hh},{x: 0, y: hh/2});
            }
            canvas.remove(shape);
            shape = new fabric.Polygon(points, {
                left: xx,
                top: yy,
                fill: 'lightpink',
                opacity: 1
            });
            canvas.add(shape);
            //shape.set({ points: points });
        } else if (shapeType == "Ellipse") {
            var rad = Math.sqrt(ww * ww + hh * hh);
            console.log(rad + ":" + ww + "-" + hh);
            shape.setLeft(startPosition.x - rad);
            shape.setTop(startPosition.y - rad);
            shape.setRadius(rad);
        }
        canvas.renderAll();
    });

    canvas.on('mouse:up', function(){
        isDown = false;
        if (shapeType == "Select")
            return;
        shape.set({
            borderColor: 'gray',
            cornerColor: 'black',
            cornerSize: 6,
            cornerRadius: 6,
            transparentCorners: true
        });
        canvas.add(shape);
    });

    canvas.on('object:selected', function(){
        drawingMode = false;         
    });

    canvas.on('selection:cleared', function(){  
        drawingMode = true;      
    });

    var canvasContainer = document.getElementsByClassName("canvas-container");
    canvasContainer[0].style.position = "absolute";
    var lowerCanvas = document.getElementsByClassName("lower-canvas");
    $(".canvas-container").appendTo('#middle');

    canvas.calcOffset();
    loaded = true;
    }

    function hideCanvas () {
        var canvasContainer = document.getElementsByClassName("canvas-container");
        canvasContainer[0].style.display = "none";
        canvas.calcOffset();
    }

    this.showCanvas = function() {
        console.log(loaded);
        //if(loaded == false)
            load();
        /*else {
            var canvasContainer = document.getElementsByClassName("canvas-container");
            canvasContainer[0].style.display = "block";
            canvas.calcOffset();
        }*/
    }
    
    
    return this;
    
});


