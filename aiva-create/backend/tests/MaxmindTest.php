<?php

use Builder\Util\TestCase;
use Builder\Util\Debug;
use GeoIp2\Database\Reader;

class MaxMindTest extends TestCase {

    public function testMaxmind() {
        global $app;

        // Download and unpack into /backend/storage
        // http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz

        $file = $app['base_dir'].'/backend/storage/GeoLite2-City.mmdb';
        if ( !file_exists( $file ) ) {
             throw new Exception('GeoLiteCity.dat database not found. Please add database to the backend/storage folder. ' .$file);
        }
        $reader = new Reader($file);
        $record = $reader->city('91.244.2.189');
        $this->assertEquals( 'UA', $record->country->isoCode );
        $this->assertEquals( 'Ukraine', $record->country->name );
        $this->assertEquals( 'Cherkasy', $record->city->name );
        $this->assertEquals( 49.4285, $record->location->latitude, '', 0.0005 );
        $this->assertEquals( 32.0621, $record->location->longitude, '', 0.0005 );
    }

}