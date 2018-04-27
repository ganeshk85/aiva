<?php namespace Builder\Analytics\Report;

class CampaignImpressions extends CampaignCtr {
 
    protected $maxImpressions = null;
    
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
        $pdf->Write(0, $this->analytics->getNumberOfCampaignTotals(), '', 0, 'L', false, 0, false, true, 0);
        
        $pdf->SetFont($this->fontTitle, '', 6);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY + 9);
        $pdf->SetX(25);
        $pdf->Write(0, 'Campaign Views', '', 0, 'L', false, 0, false, true, 0);
        $this->nY += 16;
        return $this;
    }
    
    
    protected function addChart() {
        $h = 27;
        $series = $this->analytics->getTotalsAsMap( $this->analytics->mergeSeries( '' ));
        // echo '<pre>'; print_r($series); die;
        $max = $this->analytics->getMaxInSeries($series, 100);
        if ( $max < 50 ) { $max = 50; }
        else if ( $max < 100 ) { $max = 100; }
        else if ( $max < 1000 ) { $max = intval(($max + 100) / 100) * 100; }

        (new CampaignChartBuilder($this->builder, $this->campaign))
            ->setPaddingBottom(5)
            ->setYLabelSuffix('')
            ->setLabelFontSize(8)
            ->setY($this->nY)
            ->setWidth(210 - 2 * $this->margin + 2)
            ->setHeight($h)
            ->setValueRange(0, $max)
            ->addSeries($series, $this->builder->getBrandColor() )
            ->add();
        return $this;
    }
    
    protected function getDevicesData() {
        $total = $this->analytics->getImpressions('');
        return array(
            'iOS' => $total ? intval( $this->analytics->getImpressions(array('os' => 'iOS')) * 100 / $total) : 0,
            'Android' => $total ? intval( $this->analytics->getImpressions(array('os' => 'Android')) * 100 / $total) : 0,
            'Windows' => $total ? intval( $this->analytics->getImpressions(array('os' => 'Windows')) * 100 / $total) : 0,
            'MacOS' => $total ? intval( $this->analytics->getImpressions(array('os' => 'Mac OS')) * 100 / $total) : 0
        );
    }
    
    protected function getCellLabel($cell) {
        if (!isset($cell['totals']) || $cell['totals'] == 0) { return ''; }
        if ($this->maxImpressions || $this->maxImpressions < $cell['totals']) {
            $this->maxImpressions = $cell['totals'];
        }
        return $cell['totals'];
    }
    
    protected function getCellColor($cell) {
        // echo 'maxImpressions: '.$this->maxImpressions.'<br />';
        if (is_null($this->maxImpressions) || $this->maxImpressions == 0) return false;

        $ratio = $cell['totals'] / $this->maxImpressions;
        $clr = $this->builder->getBrandColor();
        $r = 0xeb + ($clr[0] - 0xeb) * $ratio;
        $g = 0xeb + ($clr[1] - 0xeb) * $ratio;
        $b = 0xeb + ($clr[2] - 0xeb) * $ratio;
        return array($r, $g, $b);
    }
    
    public function add() {
        $this->builder->AddPage();
        $this->pageTitle('IMPRESSION DETAILS');
        $this->addY(9)->hr();
        
        $this->addY(4)->section('Weekly Overview of', 'Impressions');
        $this->setY(56)->addSubmittedNumber();
        $this->setY(70)->addChart();
        $this->setY(102)->hr();
        $this->setY(107)->section('A Closer Look At', 'Impressions by Day and Time');
        $this->addY(9)->addWeekBreakdown();

        $this->setY(199)->addDevicesBreakdown()->addAbBreakdown();
        $this->setY(204)->section('Breakdown Between', 'Mobile and Desktop Devices', $this->margin + 4);
        $this->addFooter();
        return $this;
    }
}