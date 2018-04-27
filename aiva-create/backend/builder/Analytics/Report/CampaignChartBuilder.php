<?php namespace Builder\Analytics\Report;

class CampaignChartBuilder extends CampaignAbstract {

    protected $paddingRight = 0;
    protected $paddingTop = 2;
    protected $paddingLeft = 15;
    protected $paddingBottom = 10;
    
    protected $labelFontSize = 10;
    
    protected $totalWidth = 0;
    protected $totalHeight = 0;

    protected $dy = null;
    protected $stepsValueY = null;
    
    // X values are probably number of days, starting from 0
    protected $minValueX = null;
    protected $maxValueX = null;
    // 
    protected $minValueY = null;
    protected $maxValueY = null;
    
    protected $dataSeries = array();
    protected $yLabelSuffix = '%';
    
    public function setWidth( $w ) {
        $this->totalWidth = $w;
        $this->dx = $this->width() / $this->builder->getDays(); 
        $this->stepsValueX = 1; 
        $this->minValueX = 0;
        $this->maxValueX = $this->builder->getDays();
        return $this;
    }
    public function setPaddingLeft($v) { $this->paddingLeft = $v;  return $this; }
    public function setPaddingRight($v) { $this->paddingRight = $v;  return $this; }
    public function setPaddingTop($v) { $this->paddingTop = $v;  return $this; }
    public function setPaddingBottom($v) { $this->paddingBottom = $v;  return $this; }
    public function setLabelFontSize($n) { $this->labelFontSize = $n;  return $this; }
    
    public function setYLabelSuffix($suffix) {
        $this->yLabelSuffix = $suffix;
        return $this;
    }
    public function setHeight($h) {
        $this->totalHeight = $h;
        return $this;
    }
    
    public function setValueRange( $min, $max ) {
        $this->dy = $this->height() / ($max - $min); // $max - $min;
        $this->stepsValueY = 10; 
        
        $this->minValueY = $min;
        $this->maxValueY = $max;
        return $this;
    }
            
    public function addSeries( $data, $color ) {
        $dates = array();
        for ( $day = $this->minValueX;
              $day <= $this->maxValueX; 
              $day++ ) {
            $dtIso = $this->isoDateValue($day);
            $dates[ $dtIso ] = isset( $data[$dtIso] ) ? $data[$dtIso] : 0;
        }
        array_push( $this->dataSeries, array( 'data' => $dates, 'color' => $color ));
        return $this;
    }
    
    // effective width of the canvas
    protected function width() { return $this->totalWidth - $this->paddingLeft - $this->paddingRight; }
    // effective height of the canvas
    protected function height() { return $this->totalHeight - $this->paddingTop - $this->paddingBottom; }
    // origin point location
    protected function xStart() { return $this->margin + $this->paddingLeft; }
    protected function yStart() { return $this->nY + $this->totalHeight - $this->paddingBottom; }
    
    protected function renderAxisLines() {
        $pdf = $this->builder->pdf();
        // add x axis line
        $pdf->SetLineStyle(array('color' => array(0xa4, 0xa4, 0xa4), 'width' => 0.01 ));
        $pdf->Line($this->xStart(), $this->yStart(), 
                   $this->xStart() + $this->width(), $this->yStart() );
        // add y axis line
        $pdf->SetLineStyle(array('color' => array(0xa4, 0xa4, 0xa4), 'width' => 0.01));
        $pdf->Line($this->xStart(), $this->yStart(), 
                   $this->xStart(), $this->yStart() - $this->height());
        return $this;
    }

    /** 
     * @return string 
     */
    protected function niceDateValue($dayIndex) { 
        $tmFrom = new \DateTime($this->builder->getFrom());
        $interval = new \DateInterval('P' . $dayIndex.'D');
        return $tmFrom->add($interval)->format("m/d/y");
    }
    
    protected function isoDateValue($dayIndex) { 
        $tmFrom = new \DateTime($this->builder->getFrom());
        $interval = new \DateInterval('P' . $dayIndex.'D');
        return $tmFrom->add($interval)->format("Y-m-d");
    }
    
    protected function niceTextValueX($x) { 
        return $x; 
    }

    protected function niceTextValueY($x) { 
        return $x . $this->yLabelSuffix; 
    }
        
    protected function renderLabelsX() {
        $pdf = $this->builder->pdf();
        
        $minDivision = 1; // show every date
        // die( 'dx= ' . $this->dx );
        if ( $this->dx < 2 ) { $minDivision = 32; } // show every 32th date
        else if ( $this->dx < 4 ) { $minDivision = 16; } // show every 16th date
        else if ( $this->dx < 8 ) { $minDivision = 8; } // show every 8th date
        else if ( $this->dx < 15 ) { $minDivision = 4; } // show every 4th date
        else if ( $this->dx < 30 ) { $minDivision = 2; } // show every second date

        // console.info ( [ "effective screen width", nEffectiveScreenWidth, "dx", dx, "minDivision", minDivision ] );
        $screenY = $this->yStart() + $this->paddingBottom - 4;
        $index = 0;
        $x = $this->minValueX;
        while( $x <= $this->maxValueX ) {
            if ( $index % $minDivision === 0 ) {
                $screenX = $this->xStart() + $this->dx * ($x - $this->minValueX);
                
                $labelText = $this->niceDateValue( $x );
                $labelWidth = $pdf->GetStringWidth( $labelText );
                
                $pdf->SetFont($this->fontTitle, '', $this->labelFontSize);
                $pdf->SetTextColor(0x66, 0x66, 0x66);
                $pdf->SetY($screenY);
                $shift = $labelWidth / 2;
                if ( $index == 0 ) { $shift = 2; }
                else if ( $index == $this->maxValueX ) { $shift = $labelWidth; }
                $pdf->SetX($screenX - $shift);
                $pdf->Write(0, $labelText, '', 0, 'L', false, 0, false, true, 0);
            }
            $x += $this->stepsValueX; $index ++;
        }
        return $this;
    }

    protected function renderLabelsY() {
        $pdf = $this->builder->pdf();
        
        // die( 'dy=' . $this->dy  .', stepsValueY=' . $this->stepsValueY );
        
        $minDivision = 1;
        if ( $this->dy * $this->stepsValueY < 10 ) { $minDivision = 5; }
        // else if ( $this->dy * $this->stepsValueY < 20 ) { $minDivision = 4; }
        // else if ( $this->dy * $this->stepsValueY < 10 ) { $minDivision = 10; }

        // die( 'mindivision = '.  $this->dy * $this->stepsValueY );
        $y = $this->minValueY;
        $index = 0; $used = 0;
        while( $y <= $this->maxValueY ) {
            if ( $index % $minDivision === 0 ) {
                $screenY = $this->yStart() - $this->dy * ($y - $this->minValueY);
                $labelText = $this->niceTextValueY( $y );
                $labelWidth = $pdf->GetStringWidth( $labelText );
                
                $pdf->SetFont($this->fontTitle, '', $this->labelFontSize);
                $pdf->SetTextColor(0x66, 0x66, 0x66);
                $pdf->SetY($screenY);
                $pdf->SetX($this->xStart() - $labelWidth - 5);
                $pdf->Write(0, $labelText, '', 0, 'L', false, 0, false, true, 0);
                
                if ( $index > 0 ) { $used ++; }
            }
            $y += $this->stepsValueY; $index ++;
        }
        
        // fix: for the case when for some reason we did not put anything at all
        if ($used == 0) {
            $screenY = $this->yStart() - $this->dy * $this->maxValueY - 3;
            $labelText = $this->niceTextValueY( $this->maxValueY );
            $labelWidth = $pdf->GetStringWidth( $labelText );

            $pdf->SetFont($this->fontTitle, '', $this->labelFontSize);
            $pdf->SetTextColor(0x16, 0x66, 0x66);
            $pdf->SetY($screenY);
            $pdf->SetX($this->xStart() - $labelWidth - 5);
            $pdf->Write(0, $labelText, '', 0, 'L', false, 0, false, true, 0);
        }
        
        return $this;
    }
    
    protected function renderSeries() {
        $pdf = $this->builder->pdf();
        foreach ( $this->dataSeries as $series ) {
            $pdf->SetLineStyle(array('color' => $series['color'], 'width' => 1 ));
            $x = $this->minValueX;
            
            $arrPolyline = array();
            $prevX = null;
            $prevY = null;
            $index = 0; $lastIndex = -1;
            foreach ( $series['data'] as $dt => $y ) {
                $screenX = $this->xStart() + $x * $this->dx;
                $screenY = $this->yStart() - $y * $this->dy;
                // if ( $index > 0 ) {
                   // $pdf->Line($prevX, $prevY, $screenX, $screenY);
                // }
                array_push( $arrPolyline, $screenX );
                array_push( $arrPolyline, $screenY );
                
                if ( $y > 0 ) { $lastIndex = $index; }
                
                // if ( $y > 0 && $index == count( $series['data'] ) - 1) {
                   // $pdf->Circle($screenX, $screenY, 1.5, 0, 360, 'FD', array(255, 255, 255), array(255, 255, 255));
                // }
                $prevX = $screenX;
                $prevY = $screenY;
                $x ++; $index++;
            }
            
            if ($lastIndex != -1) {
                array_splice( $arrPolyline, ($lastIndex+1)*2 );
            }
            // echo 'last index = '. $lastIndex.'<br />';
            // print_r($arrPolyline); die;
            $pdf->Polyline( $arrPolyline );
            
            if ($lastIndex != -1) {
                $index = 0;
                $x = $this->minValueX;
                foreach ( $series['data'] as $dt => $y ) {
                    if ( $index === $lastIndex ) {
                        $screenX = $this->xStart() + $x * $this->dx;
                        $screenY = $this->yStart() - $y * $this->dy;
                        $pdf->Circle($screenX, $screenY, 1.5, 0, 360, 'FD', 
                                array(255, 255, 255), array(255, 255, 255));                        
                    }
                    $x ++; $index++;
                }
                
            }
        }
        return $this;
    }
    
    public function add() {
        // $pdf->Rect( $this->margin, $this->nY, $this->totalWidth, $this->totalHeight,
        //   'F', array(), array(0xfc, 0xfc, 0xfa));
        
        $this->renderAxisLines();
        $this->renderLabelsX();
        $this->renderLabelsY();
        $this->renderSeries();
        return $this;
    }
}
