<?php namespace Builder\Analytics\Report;

class Shape {

    protected $pdf = null;
    protected $canvasWidth  = 0;
    protected $canvasHeight = 0;
    
    public function __construct( $pdf, $canvasWidth = 0, $canvasHeight = 0) {
        $this->pdf = $pdf;
        $this->canvasWidth = $canvasWidth;
        $this->canvasHeight = $canvasHeight;
    }
    
    public function setBounds($x, $y, $width, $height) {
        $this->bounds = array(
            'x' => $x,
            'y' => $y,
            'width' => $width, 
            'height' => $height
        );
        $this->dx = $width / $this->canvasWidth;
        $this->dy = $height / $this->canvasHeight;
        return $this;
    }
    
    public function setColor($color, $colorIndex) {
        $this->colorIndex = 1;
        if (is_array( $colorIndex )) {
            $this->color = $colorIndex;
        } else {
            $this->colorIndex = $colorIndex;
            $this->color = $color;
        }
        return $this;
    }
    
    public function getColor() {
        return array( 
            $this->color[0] * $this->colorIndex, 
            $this->color[1] * $this->colorIndex,
            $this->color[2] * $this->colorIndex    
        );    
    }
    
    protected function transformCoords($polygon) {
        $r = array();
        foreach ( $polygon as $coords ) {
            $dstX = round( $this->bounds['x'] + $this->dx * $coords[0], 2);
            $dstY = round( $this->bounds['y'] + $this->dy * $coords[1], 2);
            array_push( $r, $dstX );
            array_push( $r, $dstY );
        }
        return $r;
    }
    
    protected function x($x) {
        return $this->bounds['x'] + $this->dx * $x;
    }
    
    protected function y($y) {
        return $this->bounds['y'] + $this->dy * $y;
    }
    
    /**
     * for full list of SVG path you can have a look at
     * https://github.com/hughsk/svg-path-parser
     * M - move
     * z - stroke and fill
     * 
     * TODO: { code:'C', command:'curveto', x1:33, y1:43, x2:38, y2:47, x:43, y:47 },
     * TODO: { code:'c', command:'curveto', relative:true, x1:0, y1:5, x2:5, y2:10, x:10, y:10 },
     * 
     * 
     * @param int $x
     * @param int $y
     * @param int $width
     * @param int $height
     * @param string $shapeString
     * @param array $color
     */
    public function path( $shapeString) {
        preg_match_all( '/([MLQTCSAZVH])([^MLQTCSAZVH]*)/sim', $shapeString, $arrMatches );
        // echo '<pre>'; 
        
        $x = $this->bounds['x'];
        $y = $this->bounds['y'];
        $width = $this->bounds['width'];
        $height = $this->bounds['height'];
        $this->polygon = array();
        $hasCurves = false;
        $this->cursor = array( 0, 0 );
        foreach ($arrMatches[1] as $index => $command) {
            if (!trim($command)) continue;
            $argument = trim( $arrMatches[2][$index] );
            // sometimes comma is missing as second argument starts with negative sign
            $argument = preg_replace('@(\d)\-@', '$1,-', $argument);
            

            $points = explode( ',', $argument );
            // echo '<strong>'.$command.'</strong> &nbsp; '.print_r($points, true).'<br />';
            switch ($command) {
                case 'M': case 'L':
                    $this->cursor = $points;
                    array_push($this->polygon, $this->cursor);
                    // echo '<pre>M'.PHP_EOL; print_r($points); echo '</pre>';
                    break;
                case 'm': case 'l':
                    $this->cursor[0] += $points[0];
                    $this->cursor[1] += $points[1];
                    array_push($this->polygon, $this->cursor);
                    // echo '<pre>m'.PHP_EOL; print_r($points); echo '</pre>';
                    break;
                case 'H': { // horizontal line to, absolute coordinates
                    $this->cursor[0] = $points[0];
                    array_push($this->polygon, $this->cursor);
                    break;
                }
                case 'h': { // horizontal line to, relative
                    $this->cursor[0] += $points[0];
                    array_push($this->polygon, $this->cursor);
                    break;
                }
                case 'V': { //vertical lineTo, absolute coordinates
                    $this->cursor[1] = $points[0];
                    array_push($this->polygon, $this->cursor);
                    break;
                }
                case 'v': { // vertical lineTo, relative coordinates
                    $this->cursor[1] += $points[0];
                    array_push($this->polygon, $this->cursor);
                    break;
                }
                case 'c': 
                    $hasCurves = true;
                    // echo '<pre>c'.PHP_EOL; print_r($points); echo '</pre>';
                    $p = array(
                        0 => $points[0] + $this->cursor[0],
                        1 => $points[1] + $this->cursor[1]
                    );
                    $p[2] = $points[2] + $p[0];
                    $p[3] = $points[3] + $p[1];
                    $p[4] = $points[4] + $p[2];
                    $p[5] = $points[5] + $p[3];
                    // array_push($this->polygon, $p);
                    // $this->cursor = array($p[0], $p[1]);
                    break;
                case 'C': 
                    $hasCurves = true;
                    // echo '<pre>C'.PHP_EOL; print_r($points); echo '</pre>';
                    // $this->cursor = array($points[4], $points[5]);
                    break;
                case 'z': case 'Z': // close path
                    if (count($this->polygon) > 0 ) {
                        //if (!$hasCurves) {
                            // print_r($this->transformCoords($this->polygon, $x, $y, $width, $height));
                            $this->pdf->SetLineStyle(array('width' => 0.5, 'color' => array(0x40, 0x00, 0x00)));
                            $this->pdf->Polygon( $this->transformCoords($this->polygon),
                                'F', array(), $this->getColor(), true);
                        // } else {
                            // $this->pdf->SVGPath($shapeString, 'F');
                        //}
                        $hasCurves = false;
                        $this->polygon = array();
                        $this->cursor =  array( 0, 0 );
                    }
                    break;
            }
        }
        // echo '<pre>'; print_r( $arrMatches ); die;
        // die( $shapeString );
    }
    
    public function ellipse( $cx, $cy, $rx, $ry) {
        $this->pdf->SetLineStyle(array('width' => 0.05, 'color' => array(0xc0, 0xc0, 0xc0)));
        $this->pdf->Ellipse( 
            $this->x( $cx ), 
            $this->y( $cy ), 
            $this->dx * $rx, 
            $this->dy * $ry,
            0, 0, 360,
            'FD', array(), $this->getColor());
        return $this;
    }
    
    public function rect( $x, $y, $width, $height ) {
        $this->pdf->SetLineStyle(array('width' => 1, 'color' => array(0x40, 0x00, 0x00)));
        $this->pdf->Rect(
            $this->x($x),
            $this->y($y),
            $this->dx * $width,
            $this->dy * $height, 
            'F', array(), $this->getColor());
        return $this;
    }    
    
    public function polygon( $coords ) {
        $this->pdf->SetLineStyle(array('width' => 1, 'color' => array(0x40, 0x00, 0x00)));
        $this->polygon = array();
        $commands = explode( ' ', trim($coords));
        foreach( $commands as $pointCoords) {
            list($x, $y) = explode(',', $pointCoords);
            array_push( $this->polygon, array( $x, $y ) );
        }
        $this->pdf->Polygon( $this->transformCoords($this->polygon),
                                'F', array(), $this->getColor(), true);
        
        // 180.1,78.1 180.1,130.9 59.1,130.9 59.1,32.8 180.1,32.8
        return $this;
    }
        
    public function drawCollection($x, $y, $width, $height, $collection, $color) {
        $this->setBounds($x, $y, $width, $height);
        foreach ( $collection as $arr ) {
            $type = $arr['type'];
            $colorIndex = isset( $arr['colorIndex'] ) ? $arr['colorIndex']: 1;
            $this->setColor( $color, $colorIndex );
            switch ( $type ) {
                case 'ellipse':
                    $this->ellipse( $arr['cx'], $arr['cy'], $arr['rx'], $arr['ry'] );
                    break;
                case 'rect':
                    $this->rect( $arr['x'], $arr['y'], $arr['width'], $arr['height'] );
                    break;
                case 'polygon':
                    $this->polygon( $arr['points'] );
                    break;
                case 'path':
                    $this->path( $arr['path'] );
                    break;
                default:
                    echo '<pre>'; print_r($arr); echo '</pre>';
            }
        }
        return $this;
    }
    
    public function drawSvgFromString( $x, $y, $width, $height, $shapeContent) {
        $this->pdf->SetFillColor(0x55, 0x86, 0xFF);
        $this->pdf->ImageSVG($shapeContent, $x, $y, $width, $height, '', '', '', 0, false);
        return $this;
    }
}