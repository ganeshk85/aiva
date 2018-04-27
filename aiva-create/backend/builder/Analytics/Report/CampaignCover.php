<?php namespace Builder\Analytics\Report;

class CampaignCover extends CampaignAbstract {
    
    public function add() {
        $pdf = $this->builder->pdf();
        $this->builder->AddPage();
        $pdf->SetMargins(0, 0, 0, 0);
        
        $pdf->Rect(0, 0, 210, 297, 'F', array(), $this->builder->getBrandColor());
        $pdf->SetY(110);
        $pdf->SetFont($this->fontTitle, 'B', 32);
        $html = '<div style="color:#fff;letter-spacing:5;text-align:center;font-size:0.7cm;">'
                  . strtoupper($this->campaign->name)
                .'</div>';
        $pdf->writeHTML($html, true, false, true, false, '');
        $pdf->SetY(135);
        $pdf->SetFont($this->fontTitle, 'B', 32);
        $html = '<div style="color:#fff;letter-spacing:8;text-align:center;font-size:1cm;line-height: 1.7cm">'
                   . ' SUMMARY OF YOUR'
                   . '<br />'
                   . $this->builder->getDays().' DAY REPORT'
                . '</div>';
        $pdf->writeHTML($html, true, false, true, false, '');
        return $this;
    }
}