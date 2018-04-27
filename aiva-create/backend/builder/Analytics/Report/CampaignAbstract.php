<?php namespace Builder\Analytics\Report;

use Builder\Projects\ProjectModel;
use Builder\Projects\PageModel as Page;
use Builder\Analytics\AnalyticsData;

abstract class CampaignAbstract {
   
    protected $builder = null;
    protected $campaign = null;
    protected $margin = 15; // left and right margin
    
    public function __construct(Builder $builder, ProjectModel $campaign ) {
        $this->builder = $builder;
        $this->campaign = $campaign;
        $this->nY = 20;
        $this->fontTitle = $this->builder->getFontTitle();
        
        $this->analytics = new AnalyticsData(
            $this->builder->getAnalyticsModel(),
            $this->campaign,
            $this->builder->getFrom(),
            $this->builder->getTo());
        
        $this->page = $this->analytics->getPage();
    }
    
    protected function setY($y) { $this->nY = $y; return $this; }
    protected function addY($y) { $this->nY += $y; return $this; }
    
    protected function hr() {
        $pdf = $this->builder->pdf();
        $pdf->SetLineStyle(array('color' => array(0xec, 0xec, 0xec)));
        $pdf->Line($this->margin, $this->nY, 210 - $this->margin, $this->nY);
        return $this;
    }
    
    protected function section( $label, $value, $offset = 15 ) {
        $pdf = $this->builder->pdf();
        $pdf->SetFont($this->fontTitle, '', 10);
        $clr = $this->builder->getBrandColor();
        $pdf->SetTextColor($clr[0], $clr[1], $clr[2]);
        $pdf->SetY($this->nY);
        $pdf->SetX($offset);
        $pdf->Write(0, $label, '', 0, 'L', false, 0, false, true, 0);

        $this->nY += 6;
        $pdf->SetFont($this->fontTitle, '', 12);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY);
        $pdf->SetX($offset);
        $pdf->Write(0, $value, '', 0, 'L', false, 0, false, true, 0);
        return $this;
    }
    
    protected function addFooter( $value = 1 ) {
        global $app;
        $pdf = $this->builder->pdf();
        $user = $this->builder->getUser();
        $customLogoExists = $user->logo_squared && file_exists( $app['base_dir'] . '/'. $user->logo_squared );
        $nY = 260;
        
        // logo
        $ratio = $customLogoExists ? 1 : 183 / 166;
        $iconSize = 15;
        $pdf->Image(
           $app['base_dir'] . '/'. ( $customLogoExists ? $user->logo_squared : 'assets/pdf/logo.png' ),
           16, $nY, $iconSize, $ratio * $iconSize, '', '', '', false, 300, '', false, false, 0);
           
        // central text,
        $pdf->SetY($nY + 4);
        $pdf->SetX($this->margin);
        $pdf->SetFont($this->fontTitle, 'B', 16);
        $pdf->SetTextColor(0xc1, 0xc1, 0xc1);
        $pdf->setFontSpacing(0.75);
        $pdf->Cell(0, 0, $this->builder->getDays().' DAY CAMPAIGN REPORT', 0, 0, 'C');
        $pdf->setFontSpacing(0);
                
        // strange number at the right with underscore
        $xCenter = 185;
        $pdf->SetFont('helvetica', '', 20);
        $clr = $this->builder->getBrandColor();
        $pdf->SetTextColor($clr[0], $clr[1], $clr[2]);
        $width = $pdf->GetStringWidth($this->builder->getPageNumber());
        $pdf->SetY($nY + 3);
        $pdf->SetX($xCenter - $width + 1);
        $pdf->Write(0, $this->builder->getPageNumber(), '', 0, 'L', false, 0, false, true, 0);
        
        $yLine = $nY + 13;
        $lineThickness = 1.7;
        $pdf->SetLineStyle(array('color' => $clr, 'width' => $lineThickness ));
        $pdf->Line($xCenter - 5, $yLine, $xCenter + 5, $yLine);
        $pdf->SetLineStyle(array('width' => 0 ));
        return $this;
    }
    
    protected function addPercentageCircle( $x, $y, $value ) {
        return $this->builder->addPercentageCircle($x, $y, $value);
    }    
    
    
    public function pageTitle( $title ) {
        $pdf = $this->builder->pdf();
        $pdf->SetMargins($this->margin, 0, $this->margin, 0);

        $pdf->SetFont($this->fontTitle, 'B', 13);
        $clr = $this->builder->getBrandColor();
        $pdf->SetTextColor($clr[0], $clr[1], $clr[2]);
        $pdf->SetY($this->nY);
        $pdf->Write(0, $title, '', 0, 'L', false, 0, false, true, 0);
        $this->addY(9);
        $pdf->SetFont($this->fontTitle, '', 11);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY);
        $pdf->Write(0, $this->campaign->name, '', 0, 'L', false, 0, false, true, 0);
        return $this;
    }
}