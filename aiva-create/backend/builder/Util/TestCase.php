<?php namespace Builder\Util;

use Silex\WebTestCase;

abstract class TestCase extends WebTestCase {

    public function createApplication() {
        global $app;
        if ( !isset( $app ) ) {
            return require __DIR__ . '/../../../test.php';
        }
        return $app;
    }
    
}