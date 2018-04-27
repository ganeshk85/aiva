<?php namespace Builder\Util;

class FitInFrame
{
    /**
     * width and height of the popup
     */
    protected $width = 0;
    protected $height = 0;
    
    /**
     * Ratio of the rectangle to fit
     */
    protected $ratio = 1;
    
    public function __construct( $width, $height ) {
        $this->width = intval( $width );
        $this->height = intval( $height );
    }
    
    public function keepRatio($w, $h) {
        $this->ratio = $w / $h;
        return $this;
    }
    
    /**
     * @return int
     */
    public function badDimension($w, $h) {
        // 'bad' - means popup is less that this current frame
        // my at least one dimension
        if ( $this->width > $w ) { return true; }
        if ( $this->height > $h ) { return true; }
        return false;
    }
    
    public function getWidth() {
        $sw = $this->width;
        // we are talking the 'frame' with given dimensions
        // and increasing it by one pixel in width
        // until both width and height of the popup 
        // will be fitting into rectangle ratio
        while ($this->badDimension($sw, $sw / $this->ratio)) {
            $sw ++;
            // echo 'inc '.$sw.'x'.($sw / $this->ratio).PHP_EOL;
        }
        return $sw;
    }
    
    /**
     * @return int
     */
    public function getTopOffset() {
        $sw = $this->getWidth();
        $sh = $sw / $this->ratio; // screen height;
        if ( $sh > $this->height ) {
            return intval( $sh - $this->height ) / 2;
        }
        return 0;
    }
}
