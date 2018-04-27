<?php namespace Builder\Util;

use Builder\Util\CurlRequest;
use Builder\Util\Executor;

class CanonicalUrl
{
    protected $url = '';
    
    public function __construct($url) {
        $this->url = $url;
    }
    
    /**
     * Get corrected URL
     * @return string
     */
    public function get() {
        $out = $this->url;
        if (!$this->url) { return ''; }
        
        if (substr($out, 0, 7 ) !== 'http://' && 
            substr($out, 0, 8) !== 'https://') {
            $out = 'http://'. $out;
        }
        return $out;
    }
    
    /**
     * 
     * @param string $otherUrl
     * @return boolean
     */
    public function isSameAs($otherUrl) {
        return ($this->get() === (new CanonicalUrl($otherUrl))->get() );
    }
        
    /**
     * @return string
     */
    public function getScreenshotName() {
        $u = str_replace( '/', '__', $this->get());
        return rawurlencode($u);
    }

    /**
     * 
     * @global array $app
     * @return string
     */
    public  function getProjectPath() {
        global $app;
        return str_replace( '\\', '/', $app['base_dir'] . '/assets/images/projects');
    }
    /**
     * 
     * @global array $app
     * @return string
     */
    public  function getScreenshotFullPath() {
        return $this->getProjectPath() . '/websites/'.$this->getScreenshotName().'.png';
    }
    
    /**
     * @global array $app
     */
    public function hasScreenshot() {
        return file_exists( $this->getScreenshotFullPath() );
    }
    
    public function screenshot() {
        $pageWidth = 255*5;
        $pageHeight = 159*5;
        if (isset( $_ENV['SCREENSHOT_SERVER'] )) {
            (new CurlRequest($_ENV['SCREENSHOT_SERVER']))->post(array(
                'method' => 'xvfb',
                'path' => $this->getProjectPath(),
                'url' => $this->get(),
                'size' => $pageWidth.'x'.$pageHeight,
                'resize' => 255,
                'crop' => 159
            ));
//            (new CurlRequest($_ENV['SCREENSHOT_SERVER']))->post(array(
//                'method' => 'fullscreen',
//                'path' => $this->getProjectPath(),
//                'url' => $this->get(),
//                'size' => $pageWidth.'x'.$pageHeight,
//                'resize' => 255,
//                'crop' => 159
//               ));
            
        } else {
            if (!isset( $_ENV['SCREENSHOT_CMD'] )) {
                throw new \Exception('Path of screen shooting utility is not configured. Please specify SCREENSHOT_CMD in your .env file');
            }
            $strCommand = $_ENV['SCREENSHOT_CMD']
                . ' --path ' . $this->getProjectPath()
                . ' --url ' . $this->get()
                . ' --size ' . $pageWidth.'x'.$pageHeight
                . ' --resize 255 --crop 255x159 --verbose ' // --clean
            ;
            (new Executor())->runInBackground( $strCommand );
        }
        return $this;
    }
    
}