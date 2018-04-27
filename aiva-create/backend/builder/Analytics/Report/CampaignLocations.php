<?php namespace Builder\Analytics\Report;

use Builder\Util\DateBreakdown;

class CampaignLocations extends CampaignAbstract {
    
    protected $arrCountryColors = array(
        array( 0x56, 0xad, 0xea ),
        array( 0x5e, 0xea, 0xdf ),
        array( 0x9f, 0xff, 0xcf ),
        array( 0x5f, 0xee, 0x81 ),
        array( 0x2c, 0xdd, 0x5b )
    );
    
    protected function addCountriesMap() {
        global $app;
        $pdf = $this->builder->pdf();
        $h = 100;
        $imageSizeX = 210 - 2*$this->margin - 45;
        $imageSizeY = $imageSizeX * 651 / 1008;
        $pdf->Image($app['base_dir'] . '/assets/pdf/worldLow.png', 
           45, $this->nY, 
           $imageSizeX, $imageSizeY, '', '', '', false, 300, '', false, false, 0);

        $arrLocations = array_keys($this->locations['countries']);
        for ( $i = 0; $i < 5; $i ++) {
            if (!isset( $arrLocations[$i] )) { break; }
            $countryIso = $this->analytics->getCountryCode( $arrLocations[$i] );
            $color = $this->arrCountryColors[$i];
            // getting shape from the master class
            $shape = (new CountryShape())->get($countryIso);
            // drawing the shape of the country - from SVG path.
            (new Shape($pdf, 1008, 651))
                    ->setBounds(45, $this->nY, $imageSizeX, $imageSizeY)
                    ->setColor($color, 1)
                    ->path($shape);
        }
        return $this;
    }
   
    protected function addTop5Legend( $target = 'total') {
        $pdf = $this->builder->pdf();
        $lineHeight = 6;
        
        // echo '<pre>'; print_r($this->locations['countries']); die;
        $totals = 0;
        foreach ( $this->locations['countries'] as $key => $val ) { $totals += $val[$target]; }
        $arrLocations = array_keys( $this->locations['countries']);
        for ( $i = 0; $i < 5; $i ++) {
            if (!isset( $arrLocations[$i] )) { break; }
            $countryName = $arrLocations[$i];
            
            $y = $this->nY + $i * $lineHeight;
            $x = $this->margin;
            $val = $this->locations['countries'][ $countryName ][ $target ] / $totals;
            $color = $this->arrCountryColors[ $i ];
            
            $pdf->SetFont($this->fontTitle, 'B', 9);
            $pdf->SetTextColor(0x66, 0x66, 0x66);
            $pdf->SetY($y);
            $pdf->SetX($x);
            $pdf->Write(0, $countryName, '', 0, 'L', false, 0, false, true, 0);
            
            // drawing background
            $x2 =  $this->margin + 33;
            $barWidth = 25;
            $barHeight = 1.2;
            $pdf->Rect( $x2, $y + 1.5, $barWidth, $barHeight, 'F', array(), array(0xe7, 0xe7, 0xe7));
         
            // drawing value, in color
            $pdf->Rect( $x2, $y + 1.5, $val * $barWidth, $barHeight, 'F', array(), $color);
            
            // circular point
            $xCircle = $x2 + $val * $barWidth;
            $yCircle = $y + 1.5 + $barHeight / 2.0;
            $pdf->Circle($xCircle, $yCircle, 1.4, 0, 360, 'F', array(), array(0xa4, 0xa4, 0xa4));
        }
        return $this;
    }
    
    protected function datesMap($data) {
        $arrMap = array();
        foreach ( $data as $record ) {
            $arrMap[ $record['dt'] ] = $record;
        }
        return $arrMap;
    }
    
    protected function addCountryHealthChart( $countryName, $x, $y, $w, $h) {
        $pdf = $this->builder->pdf();
        $countryIso = $this->analytics->getCountryCode( $countryName );
        if (!isset($this->locations['series'][$countryIso])) { return; }

        $data = $this->locations['series'][$countryIso];
        $mapDt = $this->datesMap( $data );
        
        $from = $this->analytics->getWeekStart();
        $to  = $this->analytics->getTo();
        $dates = (new DateBreakdown())->getPeriodBetween( $from, $to );
        
        $minY = 0; $maxY = 100;
        $dy = $h / (float)($maxY - $minY);
        $dx = $w  / count( $dates );
        // echo '<pre>'; print_r([ 'dx' => $dx, 'mapDt' => $mapDt, 'dates' => $dates]); echo '</pre>';
        
        $prev = array();
        $points = array();
        
        
        $xPoint = $x; $pIndex = 0;
        foreach ( $dates as $dt ) {
            $yPoint = $y + $h;
            if ( isset( $mapDt[$dt] ) && isset( $mapDt[$dt]['total'] ) ) {
               // print_r( $mapDt[$dt] );
               $success = isset($mapDt[$dt]['success']) ? $mapDt[$dt]['success'] : 0;
               $ctr = $success * 100 / $mapDt[$dt]['total'];
               $yPoint = $y + $h - $dy * $ctr; 
            }
            if ($pIndex == 0 || $pIndex == count($dates) - 1) {
                $pdf->SetLineStyle(array( 'color' => $this->builder->getBrandColor(), 'width' => 1 ));
                $pdf->Circle($xPoint, $yPoint, 0.5, 0, 360, 'FD', array(255, 255, 255), array(255, 255, 255));
            }
            if ( count( $prev )) {
                $pdf->SetLineStyle(array( 'color' => $this->builder->getBrandColor(), 'width' => 0.7 ));
                $pdf->Line( $prev['x'], $prev['y'], $xPoint, $yPoint );
            }
            $prev = array( 'x' => $xPoint, 'y' => $yPoint );
            array_push( $points, $prev);
            $xPoint += $dx;
            $pIndex ++;
        }
        // $pdf->Rect( $x, $y, $w, $h, 'D', array(), array(0xe7, 0xe7, 0xe7));
    }
   
    protected $arrColumnNames = array();
    protected $arrColumnWidths = array( 40, 22, 16, 38, 28, 40 );

    protected function addTop10Table() {
        $pdf = $this->builder->pdf();
        $y = $this->nY;
        $lineHeight = 9;

        // adding table head
        $pdf->Rect( 
            $this->margin, $y, 
            210 - 2 * $this->margin, $lineHeight, 'F', array(), $this->builder->getBrandColor());
        
        $pdf->SetFont($this->fontTitle, 'B', 7);
        $pdf->SetTextColor(0xFF, 0xFF, 0xFF);
        
        $x = $this->margin;
        foreach ( $this->arrColumnWidths as $index => $w ) {
            $captionValue = $this->arrColumnNames[ $index ];
            $captionWidth = $pdf->GetStringWidth($captionValue);
            $pdf->SetY($y);
            $pdf->SetX($x + $w / 2.0 - $captionWidth / 2.0 );
            $pdf->Write($lineHeight, $captionValue, '', 0, 'L', false, 0, false, true, 0);
            $x += $w;
        }
        
        $arrLocations = array_keys( $this->locations['countries']);
        // adding the body stripes
        $pdf->SetFont($this->fontTitle, '', 7);
        for ( $i = 1; $i < 10; $i += 2 ) {
            if (!isset( $arrLocations[$i-1] )) { break; }
            $pdf->Rect( 
                $this->margin, $y + $i * $lineHeight, 
                210 - 2 * $this->margin, $lineHeight, 'F', array(), array(0xf6, 0xf6, 0xf6));
        }
        
        $styleFore = array( 'color' => array( 0x00, 0x00, 0x66 ), 'width' => 0.7 );
        $pdf->SetLineStyle($styleFore);
        // echo '<pre>'; print_r( $this->locations['countries'] ); die;
        
        // go through value cells
        for ( $i = 0; $i < 10; $i ++ ) {
            if (!isset( $arrLocations[$i] )) { break; }
            $countryName = $arrLocations[$i];
            $thisWeek = isset( $this->thisWeek['countries'][$countryName] ) ? 
                        $this->thisWeek['countries'][$countryName] : array('total' => 0, 'success' => 0);
            $lastWeek = isset( $this->lastWeek['countries'][$countryName] ) ? 
                        $this->lastWeek['countries'][$countryName] : array('total' => 0, 'success' => 0);
            
            $y = $this->nY + $lineHeight + $i * $lineHeight;
            $x = $this->margin;
            foreach ( $this->arrColumnWidths as $columnIndex => $w ) {
                // $pdf->Line( $x, $y + 1, $x, $y + $lineHeight - 1);
                
                $valueCell = '';
                if ( $columnIndex == 0 ) {
                    $valueCell = $countryName;
                } else if ( $columnIndex == 1 ) {    
                    // timeline here
                    $this->addCountryHealthChart( $countryName, $x, $y + 2, $w, $lineHeight - 4 );
                } else if ( $columnIndex == 2 ) {    
                    // visitors
                    $valueCell = $this->locations['countries'][$countryName]['total'];
                    if ($valueCell == 0) { $valueCell = ''; }
                } else if ( $columnIndex == 3 ) {    
                    // success
                    $valueCell = $this->locations['countries'][$countryName]['success'];
                    // if ($valueCell == 0) { $valueCell = ''; }
                } else if ( $columnIndex == 4 ) {    
                    // conversion
                    $total = $this->locations['countries'][$countryName]['total'];
                    $success = $this->locations['countries'][$countryName]['success'];
                    if ($success && $total) { $valueCell = intval($success * 100 / $total).'%'; }
                    else { $valueCell = '0%'; }
                } else if ( $columnIndex == 5 ) {    

                    // weekly growth
                    if ( ! isset( $thisWeek['total'] ) || $thisWeek['total'] == 0 ) {
                        $valueCell = '--';
                    } else {
                        $thisWeekCtr = round( (float)$thisWeek['success'] * 100 / (float)$thisWeek['total'], 2);
                        if ( isset( $lastWeek['total']) && $lastWeek['total'] != 0 ) {
                            $lastWeekCtr = round( (float)$lastWeek['success'] * 100 / (float)$lastWeek['total'], 2);
                            if ( $lastWeekCtr == 0 ) {
                                $valueCell = 100;
                            } else { 
                                $valueCell = intval( ($thisWeekCtr - $lastWeekCtr) * 100 / $lastWeekCtr );
                            }
                        } else {
                            $valueCell = $thisWeekCtr ? 100 : '';
                        }
                    }
                    
                } else {
                    $valueCell = ''; // $this->arrMockData[$i][$columnIndex];
                }
                $valueWidth = $pdf->GetStringWidth($valueCell);
                
                $alignedLeft = ($columnIndex === 0);
                $pdf->SetTextColor(0x66, 0x66, 0x66);
                if ( $columnIndex == 5 && $valueCell !== '' ) {
                    if ( $valueCell > 0 ) { 
                        $pdf->SetTextColor(0x2c, 0xdd, 0x5b); 
                    } else if ( $valueCell < 0 ) { 
                        $pdf->SetTextColor(0xff, 0x3a, 0x3a); 
                    }
                    $valueCell = $valueCell . '%';
                }
                
                $pdf->SetY($y);
                $pdf->SetX($x + ($alignedLeft ? 2 : ($w / 2.0 - $valueWidth / 2.0)) );
                $pdf->Write($lineHeight, $valueCell, '', 0, 'L', false, 0, false, true, 0);
           
                $x += $w;
            }
        }

    }
    
    public function add() {
        $this->builder->AddPage();
        
        $this->arrColumnNames = array(
            'Country', 'Timeline', 'Visitors', 
            $this->analytics->getActionNames(), 'Conversion Rate', 'Weekly Growth'
        );
        $this->locations = $this->analytics->getLocationMapData('');
 
        $tw = $this->analytics->thisWeek();
        $lw = $this->analytics->prevWeek();
        $this->thisWeek = $this->analytics->getLocationMapData('', $tw[0], $tw[1] );
        $this->lastWeek = $this->analytics->getLocationMapData('', $lw[0], $lw[1] );
        
        // echo '<pre>';
        // echo print_r( $this->locations, true );
        $this->pageTitle('LOCATION DETAILS');
        $this->addY(9)->hr();
        $this->addY(4)->section('Quick Look At', 'Top 5 Countries');
        $this->setY(55)->addCountriesMap();
        $this->setY(120)->addTop5Legend();
        $this->setY(160)->addTop10Table();
        $this->addFooter();
        return $this;
    }
}