<?php namespace Builder\Analytics\Report;

class TableOfContents {
 
    protected $builder = null;
    
    public function __construct(Builder $builder) {
        global $app;
        $this->builder = $builder;
        $this->fontFooter = \TCPDF_FONTS::addTTfFont(
                $app['base_dir'] . '/assets/pdf/DejaVuSans.ttf', 
                'TrueTypeUnicode', '', 32);
    }
    
    protected function getDays() {
        $tmFrom = new \DateTime($this->builder->getFrom());
        $tmTo = new \DateTime( $this->builder->getTo());
        return $tmTo->diff($tmFrom)->format("%a");
    }
    
    public function addPage() {
        $pdf = $this->builder->pdf();
        $this->builder->AddPage();
        $pdf->SetX(40);
        $pdf->SetY(270);
        $pdf->SetFont($this->fontFooter, '', 20);
        $html = '<div style="color:#c1c1c1;text-align:center;font-size:0.6cm;">'
                   .'AIVA ' . $this->getDays().' DAY REPORT'
                .'</div>';
        $pdf->writeHTML($html, true, false, true, false, '');
        $this->nY = 40;
        $this->nPage++;
    }
    
    protected $nCampaignLineHeight = 10;
    protected $nMetricsLineHeight = 13;
    
    protected $arrMetrics = array(
        'summary' => 'Campaign Summary', 
        'ctr' => 'CTR Details', 
        'impressions' => 'Impression Details', 
        'locations' => 'Location Details'
    );
    
    protected function addAllMetrics() {
        $pdf = $this->builder->pdf();
        $strHexColor = $this->builder->getHexColor($this->builder->getBrandColor());
        
        foreach ($this->arrMetrics as $metricsId => $metricsTitle) {
            if ($this->builder->hasMetrics($metricsId)) {
                $pdf->SetFont($this->fontFooter, '', 14);
                
                $pdf->setY($this->nY);
                $html = '<div style="text-align:right; color:#666;">' 
                        . sprintf('%02d', $this->nPage) .' &nbsp; '
                        . '</div>';
                $pdf->writeHTML($html, true, false, true, false, '');
                $pdf->setX(50);
                $pdf->setY($this->nY);

                $html = '<div>'
                    . ' &nbsp; &nbsp; &nbsp; &nbsp; '
                    . '<span style="color:'.$strHexColor.';">' . sprintf('%02d', $this->nMetricsIterator ) .'. </span>' 
                    . ' &nbsp;  '
                    . '<span style="color:#494949;">' . $metricsTitle .'</span>' 
                  . '</div>';
                $pdf->writeHTML($html, true, false, true, false, '');
        
                // add one more line
                $this->nMetricsIterator ++;
                $this->nY += $this->nMetricsLineHeight;
                $this->nPage ++;
            }
        }
        $this->nY += 10;
    }
    
    /**
     * Doing 1 loop through campaigns to know exactly where it is ended
     * @return int
     */
    public function getNumberOfTocPages() {
        $nTotalCampaigns = count($this->builder->getCampaigns());
        $nTocPages = 1;
        $nY = 90;
        $nCampaignIndex = 1;
        foreach ( $this->builder->getCampaigns() as $objCampaign ) {
            $nY += $this->nCampaignLineHeight + 10;
            foreach ($this->arrMetrics as $metricsId => $metricsTitle) {
                if ($this->builder->hasMetrics($metricsId)) {
                    $nY += $this->nMetricsLineHeight;
                }
            }
            $nCampaignIndex ++;            
            $weHaveMore = $nCampaignIndex <= ($nTotalCampaigns - 1);
            if ( $weHaveMore && $nY > (270 - 82)) { // each section takes 82.
                $nY = 20; $nTocPages ++;
            }
        }
        return $nTocPages;
    }
    
    public function add() {
        global $app;
        $pdf = $this->builder->pdf();
        $this->nPage = 2 + $this->getNumberOfTocPages();
        $this->builder->AddPage();
        $strHexColor = $this->builder->getHexColor($this->builder->getBrandColor());
        $pdf->SetMargins(0, 0, 0, 0);
        $pdf->SetFont($this->fontFooter, 'B', 17);
        $html = '<div style="color:'.$strHexColor.';text-align:center;font-size:0.8cm;letter-spacing: 5">'
                   .'TABLE OF CONTENTS'
                .'</div>';
        $pdf->setY(38);
        $pdf->writeHTML($html, true, false, true, false, '');
                
        $this->nY = 90;
        $pdf->SetMargins(20, 0, 20, 0);
        
        $nCampaignIndex = 1;
        $nTotalCampaigns = count($this->builder->getCampaigns());
        foreach ( $this->builder->getCampaigns() as $objCampaign ) {
            
            $pdf->SetFont($this->fontFooter, '', 16);
            $pdf->Rect(170, $this->nY - 4, 
                       180, $this->nCampaignLineHeight + 5, 
                      'F', array(), $this->builder->getBrandColor());
            $pdf->setY($this->nY);
            $html = '<div style="text-align:right; color:white;">' 
                    . sprintf('%02d', $this->nPage) .' &nbsp; '
                    . '</div>';
            $pdf->writeHTML($html, true, false, true, false, '');
            
            $pdf->setX(20);
            $pdf->setY($this->nY);
            $weHaveMore = $nCampaignIndex <= ($nTotalCampaigns - 1);
            $html = '<div>' 
                    . '<span style="color:'. $strHexColor. ';">' . ' CAMPAIGN '.$nCampaignIndex .': </span>' 
                    . '<span style="color:#494949;">' . strtoupper( $objCampaign->name ) .'</span>' 
                  . '</div>';
            $pdf->writeHTML($html, true, false, true, false, '');
            $this->nPage ++;
            $this->nMetricsIterator = 1;
            $this->nY += $this->nCampaignLineHeight + 10;
            $this->addAllMetrics();
            $nCampaignIndex ++;
            
            if ( $weHaveMore && $this->nY > (270 - 82)) { // each section takes 82.
                $this->addPage();
            }
        }
        return $this;
    }
}