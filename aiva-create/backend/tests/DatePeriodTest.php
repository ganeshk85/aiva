<?php

use Builder\Util\TestCase;
use Builder\Util\DateBreakdown;

class DatePeriodTest extends TestCase {

    protected $breakdown;
    
    public function setUp() {
        parent::setUp();
        $this->breakdown = new DateBreakdown();
    }
        
    public function testWeekDetection() {
        $this->assertEquals( '2016-11-01', $this->breakdown->getFirstDayInAWeek('2016-11-07') );
        $this->assertEquals( '2016-10-25', $this->breakdown->getFirstDayInAWeek('2016-10-31') );
        $this->assertEquals( '2016-12-28', $this->breakdown->getFirstDayInAWeek('2017-01-03') );
    }
    
    public function testSamePeriodDayByDay() {
        $dayInMonth = array(0,
            31, 28, 31, 30, 31, 30, 
            31, 31, 30, 31, 30, 31);
        for ( $m = 2; $m <= 12; $m++ ) {
            for ( $d = 1; $d <= $dayInMonth[$m]; $d ++  ) {
                $isoDateFrom = '2017-' . sprintf('%02d', $m) . '-' . sprintf('%02d', $d);
                $isoDateTo   = '2017-' . sprintf('%02d', $m) . '-' . sprintf('%02d', $dayInMonth[$m]);
//                $this->assertEquals( $isoDateFrom . '__' . $isoDateTo, 
//                    implode( "__", $this->breakdown->getPreviousPeriod( $isoDateFrom, $isoDateTo ) )
//                );
            }
        }
    }
    
    public function testSamePeriodDetection() {
        $this->assertEquals( '2016-11-01__2016-11-07', 
            implode( "__", $this->breakdown->getPreviousPeriod('2016-11-08', '2016-11-14') )
        );
//        $this->assertEquals( '2016-07-01__2016-12-31', 
//            implode( "__", $this->breakdown->getPreviousPeriod('2017-01-01', '2017-06-31') )
//        );
    }
}