<?php namespace Builder\Analytics\Report;

use Builder\Analytics\Svg\Flag;
use Builder\Analytics\Svg\Pie;
use Builder\Analytics\Svg\Percentage;
use Builder\Analytics\Svg\Stack;
use Builder\Analytics\Svg\Tag;
use Builder\Analytics\Svg\Email;
use Builder\Analytics\Svg\Desktop;
use Builder\Analytics\Svg\Mobile;
use Builder\Analytics\Svg\Target;

class IconShape {
    
    protected $shape = '';
    protected $pdf = null;
    
    public function __construct($pdf, $shape) {
        $this->pdf = $pdf;
        $this->shape = $shape;
    }
/*    
    public function sizeOf() {
       switch ( $this->shape ) {
            case 'flag':
            case 'pie':
            case 'percentage':
            case 'stack':
            case 'tag':
                return 256;
                
            case 'email':
            case 'desktop':
            case 'mobile':
            case 'target':
                return 512;
        } 
        return 0;
    }
    
    public function getCollections() {
        switch ( $this->shape ) {
            // These are 256x256
            case 'flag':
                return Flag::$shape;
            case 'pie':
                return Pie::$shape;
            case 'percentage':
                return Percentage::$shape;
            case 'stack':
                return Stack::$shape;
            case 'tag':
                return Tag::$shape;
                
            // These are 512x512
            case 'email':
                return Email::$shape;
            case 'desktop':
                return Desktop::$shape;
            case 'mobile':
                return Mobile::$shape;
            case 'target':
                return Target::$shape;
        }
    }*/
    
    public function getSvg($color) {
        switch ( $this->shape ) {
            // These are 256x256
            case 'flag':
                return (new Flag())->getFileAsString($color);
            case 'pie':
                return (new Pie())->getFileAsString($color);
            case 'percentage':
                return (new Percentage())->getFileAsString($color);
            case 'stack':
                return (new Stack())->getFileAsString($color);
            case 'tag':
                return (new Tag())->getFileAsString($color);
                
            // These are 512x512
            case 'email':
                return (new Email())->getFileAsString($color);
            case 'desktop':
                return (new Desktop())->getFileAsString($color);
            case 'mobile':
                return (new Mobile())->getFileAsString($color);
            case 'target':
                return (new Target())->getFileAsString($color);
        }
    }
    
    public function draw( $x, $y, $width, $height, $color) {
        $this->pdf->SetLineStyle(array('width' => 0.01, 'color' => $color));
        // $size = $this->sizeOf();
        $shape = new Shape( $this->pdf );
        // $shape->drawCollection( $x, $y, $width, $height, $this->getCollections(), $color);
        $shape->drawSvgFromString( $x, $y, $width, $height, $this->getSvg($color));
    }
}
