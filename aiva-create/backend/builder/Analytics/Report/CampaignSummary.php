<?php namespace Builder\Analytics\Report;

use Builder\Util\DateBreakdown;
use Builder\Util\FitInFrame;
use Builder\Analytics\Report\IconShape;

class CampaignSummary extends CampaignAbstract {
 
    protected function fitIntoRect($thumbWidth, $thumbHeight, $bkSizeX, $bkSizeY) {
        $ratioOfImage = $thumbHeight / $thumbWidth;
        $w = 1;
        $fitting = ($w < $bkSizeX) && ($w * $ratioOfImage < $bkSizeY );
        while ($fitting) {
            $w ++;
            $fitting = ($w < $bkSizeX) && ($w * $ratioOfImage < $bkSizeY );
        }
        return $w;
    }
    
    protected function addThumbnail() {
        global $app;
        $pdf = $this->builder->pdf();

        // Thumbnail background
        $ratio  = 733.0 / 994.0;
        $imageBkSizeX = 80;
        $imageBkSizeY = 59;
        
        $pdf->Image(
           $app['base_dir'] . '/assets/pdf/html.png',
           16, $this->nY, $imageBkSizeX, $imageBkSizeY, '', '', '', false, 300, '', false, false, 0);
        
        $pathThumbnail = $this->analytics->getThumbnailPath();
        if ( file_exists($pathThumbnail)) {
            list($thumbWidth, $thumbHeight) = getimagesize($pathThumbnail);
            // Thumbnail itself
            $ratioThumbnail  = $thumbHeight / $thumbWidth;
            $imageSizeX = $this->fitIntoRect($thumbWidth, $thumbHeight, $imageBkSizeX, $imageBkSizeY);
            $imageSizeY = $ratioThumbnail * $imageSizeX;
//            
//            die( print_r([
//                $thumbWidth, $thumbHeight, "<br />",
//                $imageBkSizeX, $imageBkSizeY, "<br />",
//                $imageSizeX, $imageSizeY
//            ], true) );
            
            $centerY = $this->nY + $imageBkSizeY / 2.0;
            $centerX = 16 + $imageBkSizeX / 2.0;
        
            // die( print_r(array( 'frame' => array( $imageSize, $ratio * $imageSize), 'sx' => $imageSizeX, 'sy' => $imageSizeY )));
            $pdf->Image(
                $pathThumbnail,
                $centerX - $imageSizeX / 2, 
                $centerY - $imageSizeY / 2, 
                $imageSizeX, $imageSizeY, 
                '', '', '', false, 300, '', false, false, 0);
        }
    }
    
    protected function addCampaignProperties() {
        $pdf = $this->builder->pdf();
        $imageWidth = 15;
        $xIcon = 108;
        $xText = $xIcon + $imageWidth + 3;
        $page = $this->page;
        $overlay = json_decode($page->overlay_json, true);
        $trigger_type = $overlay['timing']['action'];
        $trigger_value = $overlay['timing']['value'];
        $icons = array(
            array(
                'shape' => 'flag', 'shapeSize' => 15, 'y' => -1,
                'image' => 'summary-flag.png', 
                'width' => 208, 'height' => 183,
                'title' => $this->analytics->getCampaignObjectiveName(),
                'value' => 'CAMPAIGN OBJECTIVE'
            ),
            array(
                'shape' => 'stack', 'shapeSize' => 15, 'y' => 0,
                'image' => 'summary-layers.png', 
                'width' => 207, 'height' => 168,
                'title' => $this->analytics->getTriggerTypeName($trigger_type),
                'value' => 'TRIGGERS'
            ),
            array(
                'shape' => 'tag', 'shapeSize' => 14, 'y' => 1,
                'image' => 'summary-badge.png', 
                'width' => 159, 'height' => 157,
                'title' => $this->analytics->getCampaignPageName(),
                'value' => 'PAGES'
            )
        );
        $clr = $this->builder->getBrandColor();
        
        foreach ( $icons as $index => $icon ) {
            $y = $this->nY + $index * 20;
//            $ratio = $icon['height'] / $icon['width'];
//            $pdf->Image(
//               $app['base_dir'] . '/assets/pdf/'.$icon['image'],
//               $xIcon, $y, $imageWidth, $ratio * $imageWidth, '', '', '', false, 300, '', false, false, 0);
            
            if (isset($icon['shape'])) {
                $iconShape = new IconShape($pdf, $icon['shape']);
                $iconShape->draw(
                    $xIcon, $y + $icon['y'], $icon['shapeSize'], $icon['shapeSize'], 
                    $this->builder->getBrandColor());
            }            
            
            $pdf->SetFont($this->fontTitle, '', 12);
            $pdf->SetTextColor(0x66, 0x66, 0x66);
            $pdf->SetY($y + 1);
            $pdf->SetX($xText);
            $pdf->Write(0, $icon['title'], '', 0, 'L', false, 0, false, true, 0);
            
            $pdf->SetFont($this->fontTitle, 'B', 8);
            $pdf->SetTextColor($clr[0], $clr[1], $clr[2]);
            $pdf->SetY($y + 9);
            $pdf->SetX($xText);
            $pdf->Write(0, $icon['value'], '', 0, 'L', false, 0, false, true, 0);
        }

        $col2 = array(
            array( 
                'value' => $trigger_value, 
                'label' => $this->analytics->getTriggerMeasurement( $trigger_type )
            ),
            array( 
                'value' => $this->analytics->getPagePosition(), 
                'label' => 'position'
            )
        );
        $xText2 = $xText + 40;
        foreach ( $col2 as $index => $item ) {
            $y = $this->nY + ($index + 1) * 20;
            
            $pdf->SetFont($this->fontTitle, '', 12);
            $pdf->SetTextColor(0x66, 0x66, 0x66);
            $pdf->SetY($y + 1);
            $pdf->SetX($xText2);
            $pdf->Write(0, $item['value'], '', 0, 'C', false, 0, false, true, 0);
            
            $pdf->SetFont($this->fontTitle, 'B', 8);
            $pdf->SetTextColor(0x66, 0x66, 0x66);
            $pdf->SetY($y + 9);
            $pdf->SetX($xText2);
            $pdf->Write(0, strtoupper( $item['label'] ), '', 0, 'C', false, 0, false, true, 0);
            
            $pdf->SetLineStyle( array( 'color' => array(0xaa, 0xaa, 0xaa) ));   
            $pdf->Line($xText2, $y, $xText2, $y + 15);
        }
    }
     
    protected function addSubmittedNumber() {
        $pdf = $this->builder->pdf();

        $iconSize = 15;
        if ( $this->analytics->hasSubmissions() ) {
            $iconShape = new IconShape($pdf, 'email');
            $iconShape->draw(
                16, $this->nY + 2, $iconSize, $iconSize, 
                $this->builder->getBrandColor());
        } else {
            $iconShape = new IconShape($pdf, 'target');
            $iconShape->draw(
                16, $this->nY + 2, $iconSize, $iconSize, 
                $this->builder->getBrandColor());
        }
        
        
        $pdf->SetFont($this->fontTitle, '', 32);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY);
        $pdf->SetX(33);
        $pdf->Write(0, $this->analytics->getNumberOfCampaignSubmissions(), 
                '', 0, 'L', false, 0, false, true, 0);
        
        $pdf->SetFont($this->fontTitle, '', 10);
        $pdf->SetTextColor(0x66, 0x66, 0x66);
        $pdf->SetY($this->nY + 14);
        $pdf->SetX(33);
        $pdf->Write(0, $this->analytics->getActionNames(), '', 0, 'L', false, 0, false, true, 0);
        return $this;
    }
    
    protected function addMobileVsDesktop() {
        $pdf = $this->builder->pdf();
        $h = 20 + 3 * 2;
        $pdf->SetLineStyle( array( 'color' => $this->builder->getBrandColor() ));
        $pdf->RoundedRect( 210 / 2, $this->nY - 3, 210 / 2, $h, 3.50, '0011', 'D');

        $iconSize = 20;
        $yIcons = $this->nY;

        // add mobile image
//        $pdf->Image(
//           $app['base_dir'] . '/assets/pdf/icon-mobile.png',
//           210 - 99, $yIcons, $iconSize, $iconSize, '', '', '', false, 300, '', false, false, 0);
//        // add desktop image
//        $pdf->Image(
//           $app['base_dir'] . '/assets/pdf/icon-desktop.png',
//           210 - 53, $yIcons, $iconSize, $iconSize, '', '', '', false, 300, '', false, false, 0);
        
        $shapeSize = 11;
        (new IconShape($pdf, 'mobile'))->draw(
                210 - 94, $yIcons + 2, $shapeSize, $shapeSize * 0.9, 
                $this->builder->getBrandColor());
        (new IconShape($pdf, 'desktop'))->draw(
                210 - 48, $yIcons + 2, $shapeSize, $shapeSize * 0.9, 
                $this->builder->getBrandColor());

        $yLabel = $yIcons + 15;
        $pdf->SetFont($this->fontTitle, '', 10);
        $pdf->SetTextColor(0x66, 0x66, 0x66);

        $pdf->SetY($yLabel);
        $pdf->SetX(210 - 95);
        $pdf->Write(0, 'Mobile');
        $pdf->SetY($yLabel);
        $pdf->SetX(210 - 51);
        $pdf->Write(0, 'Desktop');
        
        // add circles for each device type
        $totals = $this->analytics->getNumberOfCampaignTotals();
        $mobile = $totals != 0 ? intval( $this->analytics->getNumberOfCampaignTotals('xs') * 100 / $totals ) : 0;
        $desktop = $totals != 0 ? intval( $this->analytics->getNumberOfCampaignTotals('lg') * 100 / $totals ) : 0;
        $x1 = 210 - 70;
        $y = $this->nY - 3  + $h / 2;
        $this->builder->addPercentageCircle($x1, $y, $mobile, 8);
        $x2 = 210 - 25;
        $this->builder->addPercentageCircle($x2, $y, $desktop, 8);
    }
    
    protected function addChart() {
        $h = 80;
        $series = $this->analytics->getСtrAsMap( $this->analytics->mergeSeries( '' ));
        $max = $this->analytics->getMaxInSeries($series, 100);
        
        (new CampaignChartBuilder($this->builder, $this->campaign))
            ->setWidth(210 - 2 * $this->margin + 2)
            ->setY($this->nY)
            ->setHeight($h)
            ->setValueRange(0, $max)
            ->addSeries($series, $this->builder->getBrandColor())
            ->add();
        // $pdf->Rect( $this->margin, $this->nY, 210 - 2 * $this->margin, $h,
           // 'F', array(), array(0xcc, 0xcc, 0xcc));
        return $this;
    }
    
    
    public function add() {
        $this->builder->AddPage();
        $this->pageTitle('CAMPAIGN SUMMARY');
        $this->setY(44)->addThumbnail();
        $this->setY(44)->addCampaignProperties();
        $this->setY(118)->addSubmittedNumber();
        $this->setY(118)->addMobileVsDesktop();
        $this->setY(160)->addChart();
        $this->addFooter();
        return $this;
    }
}