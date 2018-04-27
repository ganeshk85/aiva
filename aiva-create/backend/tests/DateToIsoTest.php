<?php

use Builder\Util\TestCase;
use Builder\Util\DateToIso;

class DateToIsoTest extends TestCase {

    public function testIso() {
        $this->assertEquals( '2016-11-21', (new DateToIso('2016-11-21', 'YYYY-MM-DD'))->get() );
    }
    
    public function testUsDates() {
        $this->assertEquals( '2016-11-21', (new DateToIso('11/21/2016', 'MM/DD/YYYY'))->get() );
    }
    
    public function testEuroDates() {
        $this->assertEquals( '2016-11-21', (new DateToIso('21.11.2016', 'DD.MM.YYYY'))->get() );
    }

    public function testNoSpaceDates() {
        $this->assertEquals( '2016-11-21', (new DateToIso('20161121', 'YYYYMMDD'))->get() );
    }

}