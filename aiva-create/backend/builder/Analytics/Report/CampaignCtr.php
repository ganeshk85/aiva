<?php namespace Builder\Analytics\Report;

use Builder\Util\DateBreakdown;

class CampaignCtr extends CampaignAbstract {
 
    protected function addSubmittedNumber() {
        $pdf = $this->builder->pdf();
        $iconSize = 7.5;
        if ( $this->analytics->hasSubmissions() ) {
            (new IconShape($pdf, 'email'))->draw(
                16, $this->nY + 1, $iconSize, $iconSize,
                $this->builder->getBrandColor());
        } else {
            (new IconShape($pdf, 'target'))->draw(
                16, $this->nY + 1, $iconSize, $iconSize,
                $this->builder->getBrandColor());
            
        }
        
        $pdf->SetFont($this->fontTitle, '', 20);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY);
        $pdf->SetX(25);
        $pdf->Write(0, $this->analytics->getNumberOfCampaignSubmissions(), '', 0, 'L', false, 0, false, true, 0);
        
        $pdf->SetFont($this->fontTitle, '', 6);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY + 9);
        $pdf->SetX(25);
        $pdf->Write(0, $this->analytics->getActionNames(), '', 0, 'L', false, 0, false, true, 0);
        $this->nY += 16;
        return $this;
    }
    
    protected function addChart() {
        $h = 27;
        $series = $this->analytics->getSubmitsAsMap( $this->analytics->mergeSeries( '' ));
        $max = $this->analytics->getMaxInSeries($series, 100);

        (new CampaignChartBuilder($this->builder, $this->campaign))
            ->setPaddingBottom(5)
            ->setYLabelSuffix('')
            ->setLabelFontSize(8)
            ->setY($this->nY)
            ->setWidth(210 - 2 * $this->margin + 2)
            ->setHeight($h)
            ->setValueRange(0, $max)
            ->addSeries($series, $this->builder->getBrandColor())
            ->add();
        return $this;
    }
    
    protected function getIntervals() {
        return array(
            0 => '12am - 2am',
            1 => '2am - 4am',
            2 => '4am - 6am',
            3 => '6am - 8am',
            4 => '8am - 10am',
            5 => '10am - 12pm',
            6 => '12pm - 2pm',
            7 => '2pm - 4pm',
            8 => '4pm - 6pm',
            9 => '6pm - 8pm',
            10 => '8pm - 10pm',
            11 => '10pm - 12am'
        );
    }
    
    protected function getCellLabel($cell) {
        if (!isset($cell['totals']) || $cell['totals'] == 0) { return ''; }
        $success = isset($cell['success']) ? $cell['success'] : 0;
        return intval($success * 100/ $cell['totals']).'%';
    }
    
    protected function getCellColor($cell) {
        if (!isset($cell['totals']) || $cell['totals'] == 0) { return false; }
        $success = isset($cell['success']) ? $cell['success'] : 0;
        $ratio = $success / $cell['totals'];
        
        $clr = $this->builder->getBrandColor();
        $r = 0xeb + ($clr[0] - 0xeb) * $ratio;
        $g = 0xeb + ($clr[1] - 0xeb) * $ratio;
        $b = 0xeb + ($clr[2] - 0xeb) * $ratio;
        return array($r, $g, $b);
    }
    
    protected function addWeekBreakdown() {
        $pdf = $this->builder->pdf();
        $h = 70;
        // $pdf->Rect( $this->margin, $this->nY, 210 - 2 * $this->margin, $h,
           // 'F', array(), array(0xee, 0xee, 0xff));

        $data = $this->analytics->getBreakdown();
        // echo '<pre>'; print_r($data); 
        $timeTo = strtotime( $this->analytics->getTo());

        $firstCol = '2.5cm';
        $weekCol = '2.2cm';
        $cellHeight = '0.55cm';
        $headerHeight = '0.7cm';
        $border = '0.01cm #bfbfbf solid';
        
        $pdf->SetY( $this->nY );
        $pdf->SetFont($this->fontTitle, '', 6);
        $html = '<div style="color:#666;">'
                . '<table style="font-weight: bold; border-left: '.$border.'; border-right: '.$border.'; width: 100%">'
                . '<thead>'
                    .'<tr style="vertical-align:top;">'
                        .'<th style="font-weight: bold; height: '.$headerHeight.';text-align:center; width:'.$firstCol.'">GMT Local Time</th>';
        for ( $i = 0; $i < 7; $i ++) {
            $indx = date('Y-m-d',strtotime('-'.(6-$i).' days', $timeTo));
            $html .= '<th style="height: '.$headerHeight.';border-left: '.$border.';text-align:center; width: '.$weekCol.';white-space: nowrap;">'
                    .date('l',strtotime('-'.(6-$i).' days', $timeTo) ) // .'<br />'.$indx
                    .'</th>';
        }
        $html .= ''
                    .'</tr>'
                . '</thead>'
                . '<tbody>';
        foreach ( $this->getIntervals() as $index => $interval ) {
            $html .= '<tr style="background: #bbb;">'
                       .'<td style="font-weight: bold; height: '.$cellHeight.';text-align:center; width:'.$firstCol.'">'.$interval.'</td>';
            for ( $i = 0; $i < 7; $i ++) {
                $indx = date('Y-m-d',strtotime('-'.(6-$i).' days', $timeTo)). 'T'.sprintf('%02d', 2*$index);
                $html .= '<td style="font-weight: normal; height: '.$cellHeight.';border-left: '.$border.';text-align:center; width: '
                            .$weekCol.';white-space: nowrap; font-size: 2mm;">' 
                            . (isset($data[$indx]) ? $this->getCellLabel($data[$indx]) : '')
                      .'</td>';
            }
            $html .= ''
                    .'</tr>';
        }
        $html .= ''
                . '</tbody>'
                . '</table>'
                . '</div>';
        $pdf->writeHTML($html, true, false, true, false, '');
        
        $baseY = $this->nY + 11;
        foreach ( $this->getIntervals() as $index => $interval ) {
            for ( $i = 0; $i < 7; $i ++) {
                $indx = date('Y-m-d',strtotime('-'.(6-$i).' days', $timeTo)). 'T'.sprintf('%02d', 2*$index);
                if (isset( $data[$indx ])) {
                    $lineColor = $this->getCellColor($data[$indx]);
                    if ( $lineColor !== false ) {
                        // main goal in this loop - to select a color
                        $pdf->SetLineStyle(array( 'width' => '0.5mm', 'color' => $lineColor));
                        $y = $baseY + $index * 5.5;
                        $pdf->Line( 40 + $i * 22 + 3, $y, 40 + ($i+1) * 22 - 3, $y);
                    }
                }
            }
        }
        $pdf->SetLineStyle( array( 'width' => '0.1mm')); 
            
        return $this;
    }
    
    protected function getDevicesData() {
        return array(
            'iOS' => $this->analytics->getSuccessRate(array('os' => 'iOS')),
            'Android' => $this->analytics->getSuccessRate(array('os' => 'Android')),
            'Windows' => $this->analytics->getSuccessRate(array('os' => 'Windows')),
            'MacOS' => $this->analytics->getSuccessRate(array('os' => 'Mac OS'))
        );
    }
    
    protected function addDevicesBreakdown() {
        $pdf = $this->builder->pdf();
        $w = (210 - 2 * $this->margin) / 2 - 5;
        $h = 52;
        $pdf->SetLineStyle(array( 'color' => $this->builder->getBrandColor() ));
        $pdf->Rect( $this->margin, $this->nY, $w, $h,
           'D', array(), array(0xee, 0xff, 0xee));
        
        $pdf->SetFont($this->fontTitle, '', 9);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY + 40);
        $pdf->SetX(20);
        $pdf->Write(0, '   iOS            Android        MacOS       Windows', '', 0, 'L', false, 0, false, true, 0);
        
        $yCircles = $this->nY + 30;
        $x = 27;
        $devices = $this->getDevicesData();
        $this->addPercentageCircle($x, $yCircles, $devices['iOS']);
        $this->addPercentageCircle($x + 20, $yCircles, $devices['Android']);
        $this->addPercentageCircle($x + 40, $yCircles, $devices['Windows']);
        $this->addPercentageCircle($x + 60, $yCircles, $devices['MacOS']);
        return $this;
    }
    
     protected function addAbBreakdown() {
        global $app;
        $pdf = $this->builder->pdf();
        $w = (210 - 2 * $this->margin) / 2 - 5;
        $x = (210 - 2 * $this->margin) / 2;
        $x += 47;

        $ratio = 213 / 360;
        $iconSize = $w * 0.35;
        $pdf->Image(
           $app['base_dir'] . '/assets/pdf/gray-eye.png',
           $x, $this->nY + 15, $iconSize, $ratio * $iconSize, '', '', '', false, 300, '', false, false, 0);
        return $this;
    }
    
    
    public function add() {
        $this->builder->AddPage();
        $this->pageTitle('CTR DETAILS');
        $this->addY(9)->hr();
        $this->addY(4)->section('Weekly Overview of', $this->analytics->getActionNames());
        $this->setY(56)->addSubmittedNumber();
        $this->setY(70)->addChart();
        $this->setY(102)->hr();
        $this->setY(107)->section('A Closer Look At', 'Average Rates by Day and Time');
        $this->addY(9)->addWeekBreakdown();

        $this->setY(199)->addDevicesBreakdown()->addAbBreakdown();
        $this->setY(204)->section('Breakdown Between', 'Mobile and Desktop Devices', $this->margin + 4);
        $this->addFooter();
        return $this;
    }
}