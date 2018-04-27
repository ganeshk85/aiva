<?php

use Builder\Util\TestCase;
use Builder\Util\FitInFrame;

// to debug the server, uncomment  and run:
// vendor\bin\phpunit tests/FitInFrameTest.php
class FitInFrameTest extends TestCase {
   
    public function testFittingFrame() {
        $width = (new FitInFrame(546, 534))->keepRatio(255, 159)->getWidth();
        $this->assertEquals(857, $width, '', 1.0);
    }
      
    public function testCentering() {
        $offset = (new FitInFrame(950, 480))->keepRatio(255, 159)->getTopOffset();
        $this->assertEquals(56, $offset, '', 1.0);
    }

    public function testHorizontalCentering() {
        $offset = (new FitInFrame(480, 950))->keepRatio(255, 159)->getTopOffset();
        $this->assertEquals(0, $offset, '', 1.0);
    }
}