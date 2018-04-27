<?php namespace Builder\Analytics\Report;

class ReportCover {
 
    /** @var Builder\Analytics\Report\Builder */
    protected $builder = null;
    
    public function __construct(Builder $builder) {
        $this->builder = $builder;
    }
    
    public function add() {
        global $app;
        $pdf = $this->builder->pdf();
        $this->builder->AddPage();
        $strHexColor = $this->builder->getHexColor($this->builder->getBrandColor());
        
        $pdf->Image(
           $app['base_dir'] . '/assets/pdf/cover_white.png',
           0, 0, 210, 297, '', '', '', false, 300, '', false, false, 0);
        
        $user = $this->builder->getUser();
        $customLogoExists = $user->logo && file_exists( $app['base_dir'] . '/'. $user->logo );
        $logoFile = $app['base_dir'] . '/'. ( $customLogoExists ? $user->logo : 'assets/pdf/logo_big.png' );
        list($widthLogo, $heightLogo) = getimagesize($logoFile);
        
        $iconSize = 20;
        $pdf->Image( $logoFile, 
            19, 280 - $iconSize, $iconSize * $widthLogo / $heightLogo, $iconSize, 
            '', '', '', false, 300, '', false, false, 0);
           
        $fontPeriod = $fontHeader = \TCPDF_FONTS::addTTfFont(
                $app['base_dir'] . '/assets/pdf/DejaVuSans.ttf', 
                'TrueTypeUnicode', '', 32);
        
        $pdf->SetY(29);
        $pdf->SetX(8);
        $pdf->SetFont($fontHeader, '', 32);
        $html = '<div style="color:#666;text-align:center;font-size:2.1cm;">'
                  . $this->builder->getDays().' DAY'
                .'</div>';
        $pdf->writeHTML($html, true, false, true, false, '');

        $pdf->SetY(52);
        $pdf->SetX(8);
        $pdf->SetFont($fontHeader, 'B', 32);
        $html = '<div style="color:'.$strHexColor.';text-align:center;font-size:3.15cm;">'
                  .'REPORT'
                .'</div>';
        $pdf->writeHTML($html, true, false, true, false, '');

        $m = 23;
        $pdf->Rect($m, 111, 210 - 2*$m, 37, 'F', array(), $this->builder->getBrandColor());
        
        $pdf->SetY(116);
        $pdf->SetX(8);
        $pdf->SetFont($fontHeader, 'B', 32);
        $html = '<div style="color:white;text-align:center;font-size:2.1cm;">'
                  .'CAMPAIGNS'
                .'</div>';
        $pdf->writeHTML($html, true, false, true, false, '');

        $yIcons = 195;
        (new IconShape($pdf, 'pie'))->draw(
                46, $yIcons, 16, 16, 
                $this->builder->getBrandColor());
        (new IconShape($pdf, 'percentage'))->draw(
                148, $yIcons, 13, 13, 
                $this->builder->getBrandColor());
        
        $pdf->SetMargins(0, 0, 20);
        $pdf->SetX(0);
        $pdf->SetY(263);
        $pdf->SetFont($fontPeriod, '', 32);
        $html = '<div style="color:#666;text-align:right;font-size:0.5cm;line-height:0.8cm;">'
                . 'From ' . $this->builder->niceDate( $this->builder->getFrom()). '<br />'
                . 'To ' . $this->builder->niceDate( $this->builder->getTo()).'</div>';
        $pdf->writeHTML($html, true, false, true, false, '');
        
        $pdf->SetMargins(0, 0, 0, 0);
        return $this;
    }
}