<?php namespace Builder\Analytics\Svg;

class Tag extends SvgAbstract {
    
    protected $file = 'tag.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color
        );
    }
    
}
        