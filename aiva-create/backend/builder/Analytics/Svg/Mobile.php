<?php namespace Builder\Analytics\Svg;

class Mobile extends SvgAbstract {
    
    protected $file = 'mobile.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color
        );
    }
    
}
        