<?php namespace Builder\Analytics\Svg;

class Desktop extends SvgAbstract {
    
    protected $file = 'desktop.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color
        );
    }
}
