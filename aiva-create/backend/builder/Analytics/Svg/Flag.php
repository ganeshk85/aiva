<?php namespace Builder\Analytics\Svg;

class Flag extends SvgAbstract {
    
    protected $file = 'flag.svg';
    
    public function getColors($color) {
        return array(
            '#27C44C' => $color,
            '#2CDD5B' => $this->getColorShade($color, 0.9)
        );
    }
}

