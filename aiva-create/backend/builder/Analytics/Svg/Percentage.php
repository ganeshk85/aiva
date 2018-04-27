<?php namespace Builder\Analytics\Svg;

class Percentage extends SvgAbstract {
    
    protected $file = 'percentage.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color
        );
    }
   
}
