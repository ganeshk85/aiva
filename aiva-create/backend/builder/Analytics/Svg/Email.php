<?php namespace Builder\Analytics\Svg;

class Email extends SvgAbstract {
    
    protected $file = 'email.svg';
    
    public function getColors($color) {
        return array(
            '#2CDD5B' => $color
        );
    }

}
        