<?php

use Builder\Util\TestCase;
use Builder\Util\Debug;
use Builder\Projects\PageObjective;
use Builder\Projects\PageModel as Page;

class PageObjectiveTest extends TestCase {
/*
    public function testPageObjectiveShouldHaveSubmissionsFromObject() {
        $objPage = Page::wherecta_name( 'Blank One' )->first();
        if ( !is_object( $objPage )) {
            throw new \Exception('No Analytics Data Found Yet');
        }
        $this->assertTrue( (new PageObjective($objPage))->hasSubmitElements() );
    }
*/
    
    public function testPageObjectiveShouldHaveSubmissionsFromString() {
        
        $html =<<< EOF
<body class="" data-vars-id-desktop="0" data-vars-per-desktop="100" data-vars-active-desktop="1" data-vars-id-mobile="0" data-vars-per-mobile="100" data-vars-active-mobile="1" style="bac
kground: transparent;"><div class="cta cta-sm cta-sm-v0" data-max="2500" style="overflow: hidden; width: 950px; height: 480px; position: relative; display: none; margin: -240px auto 0px;
"></div><div class="cta cta-lg cta-lg-v0" data-max="2500" style="overflow: hidden; width: 801px; height: 432px; position: relative; display: block; margin: -216px auto 0px; cursor: auto;
"><form action="cta.php" data-name="aivaForm"><img data-name="emoji" src="assets/images/emojis/512/1f4ae.png" data-id="emoji-1480539826804" class="aiva-elem emoji-1480539826804 1f4ae ng-
scope ui-draggable-handle" style="left: 147px; top: 135px; width: 291px; height: 291px; overflow: hidden;"><div class="aiva-elem textBox textBox-1480602079297 ui-draggable-handle" data-n
ame="textBox" data-id="textBox-1480602079297" style="left: 447px; top: 153px; width: 327px; height: 240px; overflow: hidden;">TEXT EXAMPLE</div><div class="aiva-elem icon-1481031717919 l
inkedin-square icon ng-scope ui-draggable-handle" data-name="icon" data-id="icon-1481031717919" style="left: 21px; top: 15px; width: auto; height: auto; font-size: 16.4213vh; overflow: h
idden;"><i class="fa fa-linkedin-square" style="background-color: inherit;        padding: 0 4px; line-height: 1.04; "></i></div><div class="aiva-elem video-1481144344255 video-container
 ng-scope ui-draggable-handle" data-id="video-1481144344255" data-name="video" style="left: 417px; top: 18px; height: 198px; width: 285px; overflow: hidden;"><iframe data-video-autoplay=
"0" showinfo="0" id="video-1481144344255" style="width: 100%; height: 100%; display: block" frameborder="0" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msal
lowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen" data-name="video" src="https://www.youtube.com/embed/lxLuWbhHKSo?autop
lay=0"></iframe><video style="width: 100%; height: 100%; display: none" controls="" 0=""><source src="" type="video/mp4"></video></div><button data-name="button" data-id="button-14812222
48783" class="aiva-elem btn button-1481222248783 btn-edged ui-draggable-handle" style="left: 186px; top: 36px; width: 120px; height: 51px;" type="submit" onclick="aivaController.submitVa
lue=`Value`;aivaController.hidePopup();" submitvalue="Value">Button</button><input type="text" class="aiva-elem textInput-1481222253215 form-control ui-draggable-disabled ui-draggable-ha
ndle" data-name="textInput" data-id="textInput-1481222253215" placeholder="text" style="left: 195px; top: 99px; width: 150px; height: 45px;"><img data-name="emoji" src="assets/images/emo
jis/512/1f62c.png" data-id="emoji-1481222260398" class="aiva-elem emoji-1481222260398 1f62c ng-scope ui-draggable-handle" style="left: 48px; top: 252px; width: 83px; height: 83px;"></for
m></div></body>
EOF;
        $this->assertTrue( (new PageObjective(trim($html)))->hasSubmitElements() );
    }
}