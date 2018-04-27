<?php namespace Builder\Analytics\Svg;

class Pie extends SvgAbstract {
    
    protected $file = 'pie_chart.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color
        );
    }
    
}
        