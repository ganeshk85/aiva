<?php

use Builder\Util\TestCase;
use Builder\Util\Debug;
use Builder\Util\CurlRequest;
use Builder\Util\Executor;

// warning: this test should not be a  part of default unit tests
// It is integrational, requires command line utility and
// server for screenshotting to be installed.

// we're keeping it for debug purposes

// to debug the server, uncomment  and run:
// vendor\bin\phpunit tests/ScreenshotTest.php
class ScreenshotTest extends TestCase {
        
    // using command line, there must be support of  cases to 
    // - 1 - capture only project by looking at its HTML file
    // - 2 - capture onle external URL
    
    // the third case, when you have both URL and project, considers
    // having that URL image should be a background there already, 
    // so it should not be a concern of the screenshoting tool - this is 
    // a responsibility of HTML export procedure.
    
    public function testScreenshotFromProject() {
        global $app;
        $outputHtmlPath = $app['base_dir'] . '/assets/images/projects';
        $projectId = 221; 
        $pageWidth = 237; 
        $pageHeight = 248;
        (new CurlRequest('http://localhost:7001'))->post(array(
            'method' => 'webshot',
            'path' => str_replace( '\\', '/', $outputHtmlPath ),
            'project' => $projectId,
            'size' => $pageWidth.'x'.$pageHeight,
            'resize' => '255'
        ));
    }
    
    public function testScreenshotFromUrl() {
        global $app;
        $outputHtmlPath = $app['base_dir'] . '/assets/images/projects';
        // $projectId = 221; $pageWidth = 237; $pageHeight = 248;
        
        $pageWidth = 255*5; $pageHeight = 159*5;
        (new CurlRequest('http://localhost:7001'))->post(array(
            'method' => 'webshot',
            'path' => str_replace( '\\', '/', $outputHtmlPath ),
            // 'project' => $projectId,
            'url' => 'http://aivalabs.com/',
            'size' => $pageWidth.'x'.$pageHeight,
            'resize' => '255',
            'crop' => '255x159'
        ));
    }

}
