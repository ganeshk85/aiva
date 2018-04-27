<?php namespace Builder\Analytics\Svg;

class Stack extends SvgAbstract {
    
    protected $file = 'stack.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color,
            '#27C44C' => $this->getColorShade($color, 0.9)
        );
    }
}
        
