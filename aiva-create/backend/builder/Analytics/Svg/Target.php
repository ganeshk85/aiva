<?php namespace Builder\Analytics\Svg;

class Target extends SvgAbstract {
    
    protected $file = 'target.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color
        );
    }
}
        