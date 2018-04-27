<?php namespace Builder\Analytics\Report;

use Builder\Projects\ProjectModel;

class Builder {
    
    protected $pdf = null;
    protected $campaigns = array();
    protected $metrics = array();
    protected $user = null;
    protected $model = null;
    protected $from = '';
    protected $to = '';
    protected $pdfPage = 0;
    protected $fontTitle = '';
    
    protected $brandColor = array( 0x2c, 0xdd, 0x5b );
    
    public function getBrandColor() {
        return $this->brandColor;
    }

    public function getHexColor($arr) {
        return '#'.sprintf('%02x', $arr[0]).sprintf('%02x', $arr[1]).sprintf('%02x', $arr[2]);
    }
    
    public function setBrandColor($color) {
        if (is_array($color)) {
            $this->brandColor = $color;
        } else if (is_object($color)) {
            $this->brandColor = array( $color->r, $color->g, $color->b );
        } else if (is_string($color)) {
            if (substr($color,0,3) === 'rgb') {
                if (preg_match( '@rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)@', $color, $match )) {
                    array_shift($match);
                    $this->brandColor = $match;
                }
            } else if (strlen($color) === 6) {
                $this->brandColor = array( 
                    hexdec( substr($color, 0, 2)), 
                    hexdec( substr($color, 2, 2)), 
                    hexdec( substr($color, 4, 2))
                );
            } else if (strlen($color) === 3) {
                $this->brandColor = array( 
                    hexdec( substr($color, 0, 1).substr($color, 0, 1)), 
                    hexdec( substr($color, 1, 1).substr($color, 1, 1)), 
                    hexdec( substr($color, 2, 1).substr($color, 2, 1))
                );
            }
        }
        return $this;
    }
    
    public function __construct($user, $model, $from, $to) {
        global $app;
        $this->user = $user;
        $this->model = $model;
        $this->from = $from;
        $this->to = $to;
        
        class_exists('TCPDF', true); // trigger Composers autoloader to load the TCPDF class
        $this->pdf =new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $this->pdf->SetAutoPageBreak(false, 0);
        // remove default footer
        $this->pdf->setPrintFooter(false);
        $this->pdf->setPrintHeader(false);
        $this->setDocumentInfo();
        
        $this->fontTitle = \TCPDF_FONTS::addTTfFont(
            $app['base_dir'] . '/assets/pdf/DejaVuSans.ttf', 
            'TrueTypeUnicode', '', 32);
    }
    
    public function setDocumentInfo() {
        // set document information
        $this->pdf->SetCreator(PDF_CREATOR);
        $this->pdf->SetAuthor('Aiva Labs');
        $this->pdf->SetTitle( $this->getDays().' Day Report');
        $this->pdf->SetSubject( $this->getDays().' Day Report');
        // $this->pdf->SetKeywords('aiva labs, report');
    }

    public function addPage() {
        $this->pdfPage ++;
        $this->pdf->AddPage();
        // add anchor , showing start of the page - for TOC navigation?
    }
    
    public function addPercentageCircle($x, $y, $value, $radius = 7) {
        $pdf = $this->pdf();
        $angle = 90;
        
        $styleBk = array( 'color' => array( 0xcc, 0xcc, 0xcc ), 'width' => 0.7 );
        $styleFore = array( 'color' => $this->getBrandColor(), 'width' => 0.7 );
        $pdf->SetLineStyle($styleFore);
        
        $angleValue = ($value >= 100) ? 360 : $value * 360 / 100; 
        if ( $angleValue <= 0 ) {
            $pdf->SetLineStyle($styleBk);
            $pdf->Circle($x, $y, $radius);
        } else if ( $angleValue >= 360 ) {
            $pdf->SetLineStyle($styleFore);
            $pdf->Circle($x, $y, $radius);
        } else {
            $pdf->Ellipse($x, $y, $radius, $radius, $angle, 360 - $angleValue, 360 - 360, 'D', $styleFore);
            $pdf->Ellipse($x, $y, $radius, $radius, $angle, 360 - 0, 360 - $angleValue, 'D', $styleBk);
        }
        $pdf->SetLineStyle(array( 'width' => 1));
        
        $pdf->SetFont($this->fontTitle, '', 8);
        $halfWidthOfPct = $pdf->GetStringWidth('%') / 2;
        
        $pdf->SetFont($this->fontTitle, 'B', 10);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $w = 2 + round( $pdf->GetStringWidth( ''.$value ));
        $h = round( $pdf->GetStringHeight($w, ''.$value ));
        // die ($w .' x ' . $h);
        // $pdf->SetY($y - ($h/2));
        $pdf->SetY($y - $radius);
        $pdf->SetX($x - ($w/2) - $halfWidthOfPct);
        $pdf->Write($radius*2, $value, '', 0, 'L', false, 0, false, true, 0);
        
        // add % sign
        $pdf->SetFont($this->fontTitle, '', 8);
        $pdf->SetY($y - $radius);
        $shift = ($value >= 100) ? 1.5 : ($value > 10 ? 1.5 : 1.8 );
        $pdf->SetX($x + $w / 2 - $shift - $halfWidthOfPct );
        $pdf->Write($radius*2, '%', '', 0, 'L', false, 0, false, true, 0);
   }    
    
    /**
     * @return \TCPDF
     */
    public function pdf() {
        return $this->pdf;
    }
    
    /**
     * @return string
     */
    public function getFontTitle() {
        return $this->fontTitle;
    }
    /**
     * @return \Builder\Analytics\AnalyticsModel
     */
    public function getAnalyticsModel(){
        return $this->model;
    }

    public function getUser() {
        return $this->user;
    }
    /**
     * @return string
     */
    public function getFrom(){
        return $this->from;
    }
    
    /**
     * @return string
     */
    public function getTo(){
        return $this->to;
    }

    /**
     * @return array of ProjectModel
     */
    public function getCampaigns(){
        return $this->campaigns;
    }
    
    /**
     * @return integer
     */
    public function getPageNumber(){
        return $this->pdfPage;
    }
    /**
     * 
     * @param string $sIds
     * @return \Builder\Analytics\Report\Builder
     */
    public function setCampaigns($sIds) {
        $arrIds = is_string($sIds) ? explode( ',', $sIds ) : $sIds;
        $this->campaigns = array();
        foreach ( $arrIds as $nCampaignId ) {
            $objCampaign = ProjectModel::find( $nCampaignId );
            if (is_object($objCampaign)) {
                $this->campaigns[] = $objCampaign;
            }
        }
        return $this;
    }
    
    /**
     * @param string $sIds
     * @return \Builder\Analytics\Report\Builder
     */
    public function setMetrics($sIds) {
        $this->metrics = explode( ',', $sIds );
        return $this;
    }
    
    /**
     * 
     * @param string $metricName
     * @return boolean
     */
    public function hasMetrics($metricName) {
        return in_array( $metricName, $this->metrics );
    }
    
    protected function th($n) {
        if ( $n === 1 ) { return  $n . 'st'; } 
        else if ( $n === 2 ) { return $n . 'nd'; }
        return $n . 'th';
    }
    
    public function niceDate( $dt ) {
        $tm = strtotime( $dt );
        return date('F', $tm).' '.$this->th(intval(date('d', $tm))).' '.date('Y', $tm);
    }
    
    public function getDays() {
        $tmFrom = new \DateTime($this->getFrom());
        $tmTo = new \DateTime( $this->getTo());
        return $tmTo->diff($tmFrom)->format("%a");
    }    
        
    public function build() {
        (new ReportCover($this))->add();
        (new TableOfContents($this))->add();
        foreach ( $this->campaigns as $objCampaign ) {
            if (true || $this->hasMetrics('cover')) {
               (new CampaignCover($this, $objCampaign))->add();
            }
            if ($this->hasMetrics('summary')) {
               (new CampaignSummary($this, $objCampaign))->add();
            }
            if ($this->hasMetrics('ctr')) {
               (new CampaignCtr($this, $objCampaign))->add();
            }
            if ($this->hasMetrics('impressions')) {
               (new CampaignImpressions($this, $objCampaign))->add();
            }
            if ($this->hasMetrics('locations')) {
               (new CampaignLocations($this, $objCampaign))->add();
            }
        }
        return $this;
    }
    
    public function download( $name = 'report.pdf') {
        return $this->pdf->Output($name);
    }
}
