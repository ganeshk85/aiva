<?php namespace Builder\Analytics\Svg;

abstract class SvgAbstract {
    
    abstract public function getColors($color);
        
    public function getColorShade($clr, $scale = 1) {
        return array( $clr[0] * $scale, $clr[1] * $scale, $clr[2] * $scale );    
    }
       
    protected $file = '';
    public function getFile() {
        return $this->file;
    }
    
    public function getFileAsString($color) {
        global $app;
        $file = $app['base_dir'] . '/assets/pdf/svg/'. $this->getFile();
        if ( file_exists($file)) {
            
            $s = file_get_contents($file);
            
            // recoloring - replacing different colors
            // echo '<pre>'; print_r($this->getColors($color)); echo '</pre>';
            foreach ($this->getColors($color) as $key => $value) {
                $hex = '#'.sprintf('%02x', $value[0]).sprintf('%02x', $value[1]).sprintf('%02x', $value[2]);
                $s = str_replace($key, $hex, $s );
            }
            return '@'.$s;
        } else {
            throw new \Exception('File is missing '.$file);
        }
    }
}