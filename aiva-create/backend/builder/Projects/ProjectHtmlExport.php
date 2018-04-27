<?php namespace Builder\Projects;

use Builder\Util\Executor;
use Builder\Util\CurlRequest;
use Builder\Util\FitInFrame;
use Builder\Util\Debug;
use Builder\Util\CanonicalUrl;
use Builder\Exports\YoutubeThumb;
use Builder\Users\UserActivatedDomains;

class ProjectHtmlExport {

    protected $project = null;
    protected $outputHtmlPath = '';
    
    protected $pageWidth = 0;
    protected $pageHeight = 0;

    // keep proportions of desired thumbnail as constants
    protected $thumbRectWidth = 255;
    protected $thumbRectHeight = 159;
    protected $margin = 10;
    
    protected $screenWidth = 0;
    protected $screenHeight = 0;
    protected $screenOffsetY = 0;
    protected $screenDim = '';

    public function __construct( ProjectModel $project ) {
	global $app;

	$this->project = $project;
        $this->page =  $this->project->pages->get(0);
        if ( !is_object( $this->page )) {
            throw new ProjectHtmlExportException("No page for the project");
        }
        $this->pageWidth = $this->page->desktop_width;
        if ( $this->pageWidth <= 0 ) {
            throw new ProjectHtmlExportException("Invalid page width ". $this->pageWidth);
        }
        $this->pageHeight = $this->page->desktop_height;
        if ( $this->pageHeight <= 0 ) {
            throw new ProjectHtmlExportException("Invalid page height ". $this->pageHeight);
        }
        $this->body = $this->page->html;
        if ( !trim( $this->body ) ) {
            throw new ProjectHtmlExportException("Nothing in the document");
        }
	$this->path = $app['base_dir'] . '/assets/images/projects';
	$this->baseUrl = $app['base_url'] . '/assets/images/projects';

        $this->outputHtmlPath = $this->path . '/project-' . $this->project->id. '.html';
	// $this->outputPng  = $this->path . '/project-' . $this->project->id. '.png';
        
        $frame = (new FitInFrame($this->pageWidth, $this->pageHeight))
                    ->keepRatio(
                        $this->thumbRectWidth - 2*$this->margin, 
                        $this->thumbRectHeight - 2*$this->margin
                    );
        $this->screenWidth = $frame->getWidth();
        $this->screenHeight = intval( $this->screenWidth * $this->thumbRectHeight / $this->thumbRectWidth );
        $this->screenDim = $this->screenWidth.'x'.$this->screenHeight; 
        $ratio = ($this->screenHeight) / $this->thumbRectHeight;
        $this->screenOffsetY = $this->margin + $frame->getTopOffset();
    }
    
    /**
     * @return string
     */
    protected function getWebsiteUrl() {
        // from project, we can get the client name, 
        $clientName = $this->project->client;
        $lstUsers = $this->project->users()->get();
        if (count($lstUsers) > 0) {
            $domains = new UserActivatedDomains($lstUsers[0]);
            if ( $clientName ) {
                // using client name, we will check what is the client URL
                return $domains->getClientUrlFromName($clientName);
            } else {
                // take the first client from the settings
                return $domains->getDefaultClientUrl();
            }
        }
        return '';
    }
    
    /**
     * get CSS property value for the background
     * @return string
     */
    protected function getBackground()
    {
        $url = $this->getWebsiteUrl();
        if ($url) {
            $u = new CanonicalUrl($url);
            if ($u->hasScreenshot()) {
                return 'url(assets/images/projects/websites/'.str_replace( '%', '%25', $u->getScreenshotName()).'.png) center top no-repeat ';
            }
        }
        // http%253A____aivalabs.com.png.1295.png
        return 'url(assets/images/projects/websites/default.png) center top no-repeat ';
        // return '#eeeeee';
    }
    
    /**
     * this function is left for debugging of \DOMElement
     * 
     * @param \DOMElement $e
     * @return type
     */

    protected function getElementAttributes(\DOMElement $el ) {
        $mapAttrtibutes = array();
        foreach ($el->attributes as $attrName => $attrNode ) {
            $mapAttrtibutes[ $attrName ] = $attrNode->nodeValue; 
        } 
        return $mapAttrtibutes;
    }
    
    protected function replaceVideoContainer( $body ) {
        $dom = new \DOMDocument('1.0', 'utf-8');
        libxml_use_internal_errors(true);
        $dom->loadHTML('<!DOCTYPE html><html>'. $body .'</html>');
        libxml_clear_errors();
        
        $a = new \DOMXPath($dom);
        $classname = 'video-container';
        $divs = $a->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $classname ')]");
        for ($i = $divs->length - 1; $i >= 0; $i--) {
            $el = $divs->item($i);
            $mapAttr = $this->getElementAttributes($el->firstChild);
            $urlOfThumbnail = (new YoutubeThumb( $mapAttr['src'] ))->getThumbnailUrl();
            while ($el->hasChildNodes()) {
               $el->removeChild($el->firstChild);
            }
            $frag = $el->ownerDocument->createDocumentFragment();
            $frag->appendXML("<img src='" . $urlOfThumbnail . "' style='width:100%; height: 100%' alt='' />");
            $el->appendChild($frag);
        }
        return preg_replace( '@^.+<html>@simU','', 
               str_replace( '</html>', '', $dom->saveHTML() ));
    }
    
    protected function insertBlurredOverlay( $body ) {
        $sInsert = '<div id="overlay-blurred"></div>';
        return preg_replace( '/<body([^>]*)>/simU', '\\0'."\n".$sInsert, $body );
    }
    
    public function generateHtml() {
	global $app;
        $root = rtrim($app['request']->getSchemeAndHttpHost().$app['request']->getBaseUrl(), '/');
	// do some patching for known bugs 
        
        $strBackground = $this->getBackground();
        // phantomjs doesn't support transform, but -webkit-transform should be supported
	// $body = str_replace( 'transform:', '-webkit-transform:', $this->body );
        $body = $this->replaceVideoContainer($this->body); 
        $body = $this->insertBlurredOverlay($body);

        $html = <<<EOF
<!doctype html>
<html lang="en">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<base href="$root/" />
                
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
<link rel="stylesheet" href="$root/assets/css/emojione.min.css" />
<link rel="stylesheet" href="$root/assets/css/toastr.min.css" />
<link rel="stylesheet" href="$root/assets/css/bootstrap.min.css" />
<link rel="stylesheet" href="$root/assets/css/iframe.css" />
<link rel="stylesheet" href="$root/themes/yeti/stylesheet.css" />

<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Exo:400|Exo+2:400|Kanit:400|Libre+Franklin:400|Prompt:400|Raleway:400|Taviraj:400|Trirong:400|Alegreya+Sans:400|Alegreya+Sans+SC:400|Roboto:400|Source+Sans+Pro:400|Titillium+Web:400|Cormorant:400|Cormorant+Garamond:400|Cormorant+Infant:400|Josefin+Sans:400|Josefin+Slab:400|Lato:400|Open+Sans:400|Proza+Libre:400|Roboto+Mono:400|Rubik:400|Catamaran:400|Work+Sans:400|Arima+Madurai:400|Cabin:400|Expletus+Sans:400|Fira+Sans:400|Merriweather:400|Merriweather+Sans:400|Ubuntu:400|Advent+Pro:400|Biryani:400|Changa:400|Dosis:400|Ek+Mukta:400|Heebo:400|Inknut+Antiqua:400|Martel:400|Martel+Sans:400|Mukta+Vaani:400|Palanquin:400|Source+Code+Pro:400|Alegreya:400|Alegreya+SC:400|Assistant:400|Athiti:400|Cairo:400|Crimson+Text:400|Maitree:400|Mitr:400|Neuton:400|Overlock:400|Playfair+Display:400|Playfair+Display+SC:400|Pridi:400|Roboto+Condensed:400|Sarpanch:400|Yantramanav:400|Abhaya+Libre:400|Atma:400|BioRhyme:400|BioRhyme+Expanded:400|Chathura:400|Cormorant+SC:400|Cormorant+Unicase:400|Cormorant+Upright:400|Eczar:400|Frank+Ruhl+Libre:400|Halant:400|Hind:400|Hind+Guntur:400|Hind+Madurai:400|Hind+Siliguri:400|Hind+Vadodara:400|Karma:400|Khand:400|Khula:400|Laila:400|Poppins:400|Rajdhani:400|Rasa:400|Teko:400|Tillana:400|Yrsa:400|Almendra:400|Amaranth:400|Amiri:400|Anonymous+Pro:400|Archivo+Narrow:400|Arimo:400|Arvo:400|Asap:400|Cabin+Condensed:400|Cambay:400|Cantarell:400|Caudex:400|Chivo:400|Cousine:400|Cuprum:400|Droid+Serif:400|Economica:400|El+Messiri:400|GFS+Neohellenic:400|Gentium+Basic:400|Gentium+Book+Basic:400|Istok+Web:400|Jura:400|Karla:400|Lemonada:400|Lobster+Two:400|Lora:400|Mada:400|Marvel:400|Maven+Pro:400|Mirza:400|Muli:400|Nobile:400|Noticia+Text:400|Noto+Sans:400|Noto+Serif:400|Orbitron:400|PT+Sans:400|PT+Serif:400|Palanquin+Dark:400|Philosopher:400|Puritan:400|Quantico:400|Quattrocento+Sans:400|Rambla:400|Roboto+Slab:400|Rosario:400|Scada:400|Share:400|Signika:400|Signika+Negative:400|Simonetta:400|Space+Mono:400|Tinos:400|Ubuntu+Mono:400|Vesper+Libre:400|Volkhov:400|Vollkorn:400|Yanone+Kaffeesatz:400" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Exo:700|Exo+2:700|Kanit:700|Libre+Franklin:700|Prompt:700|Raleway:700|Taviraj:700|Trirong:700|Alegreya+Sans:700|Alegreya+Sans+SC:700|Roboto:700|Source+Sans+Pro:700|Titillium+Web:700|Cormorant:700|Cormorant+Garamond:700|Cormorant+Infant:700|Josefin+Sans:700|Josefin+Slab:700|Lato:700|Open+Sans:700|Proza+Libre:700|Roboto+Mono:700|Rubik:700|Catamaran:700|Work+Sans:700|Arima+Madurai:700|Cabin:700|Expletus+Sans:700|Fira+Sans:700|Merriweather:700|Merriweather+Sans:700|Ubuntu:700|Advent+Pro:700|Biryani:700|Changa:700|Dosis:700|Ek+Mukta:700|Heebo:700|Inknut+Antiqua:700|Martel:700|Martel+Sans:700|Mukta+Vaani:700|Palanquin:700|Source+Code+Pro:700|Alegreya:700|Alegreya+SC:700|Assistant:700|Athiti:700|Cairo:700|Crimson+Text:700|Maitree:700|Mitr:700|Neuton:700|Overlock:700|Playfair+Display:700|Playfair+Display+SC:700|Pridi:700|Roboto+Condensed:700|Sarpanch:700|Yantramanav:700|Abhaya+Libre:700|Atma:700|BioRhyme:700|BioRhyme+Expanded:700|Chathura:700|Cormorant+SC:700|Cormorant+Unicase:700|Cormorant+Upright:700|Eczar:700|Frank+Ruhl+Libre:700|Halant:700|Hind:700|Hind+Guntur:700|Hind+Madurai:700|Hind+Siliguri:700|Hind+Vadodara:700|Karma:700|Khand:700|Khula:700|Laila:700|Poppins:700|Rajdhani:700|Rasa:700|Teko:700|Tillana:700|Yrsa:700|Almendra:700|Amaranth:700|Amiri:700|Anonymous+Pro:700|Archivo+Narrow:700|Arimo:700|Arvo:700|Asap:700|Cabin+Condensed:700|Cambay:700|Cantarell:700|Caudex:700|Chivo:700|Cousine:700|Cuprum:700|Droid+Serif:700|Economica:700|El+Messiri:700|GFS+Neohellenic:700|Gentium+Basic:700|Gentium+Book+Basic:700|Istok+Web:700|Jura:700|Karla:700|Lemonada:700|Lobster+Two:700|Lora:700|Mada:700|Marvel:700|Maven+Pro:700|Mirza:700|Muli:700|Nobile:700|Noticia+Text:700|Noto+Sans:700|Noto+Serif:700|Orbitron:700|PT+Sans:700|PT+Serif:700|Palanquin+Dark:700|Philosopher:700|Puritan:700|Quantico:700|Quattrocento+Sans:700|Rambla:700|Roboto+Slab:700|Rosario:700|Scada:700|Share:700|Signika:700|Signika+Negative:700|Simonetta:700|Space+Mono:700|Tinos:700|Ubuntu+Mono:700|Vesper+Libre:700|Volkhov:700|Vollkorn:700|Yanone+Kaffeesatz:700" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,700italic,400,300,700" />

<style type='text/css'>
{$this->page->css}

body { margin-top: 0px; background: none !important; }
#overlay-blurred {
    position: fixed; z-index: 0; overflow:hidden; top: 0px; left: 0px; width: 100%; height: 100%; 
    -webkit-filter: blur(5px);
    filter: blur(5px);
    background: {$strBackground} !important; 
    background-size: {$this->screenWidth}px !important;
}
.cta-sm {display: none !important; }
.cta-lg {display: block !important; }
.cta { outline: none !important; margin: 0px auto !important; margin-top: {$this->screenOffsetY}px !important}

</style>
{$body}
</html>
EOF;

// save html as file
	file_put_contents( $this->outputHtmlPath, $html );
	return $this;
    }
    
    /**
     * @return array
     */
    protected function getPngGenerationOptionsArray() {
        return array(
            'path' => str_replace( '\\', '/', dirname( $this->outputHtmlPath )),
            'project' => $this->project->id,
            'size' => $this->screenDim,
            'resize' => $this->thumbRectWidth,
            'crop' => $this->thumbRectWidth.'x'.$this->thumbRectHeight
        );
    }

    public function generatePng() {
        $arrRequest = $this->getPngGenerationOptionsArray();
        if (isset( $_ENV['SCREENSHOT_SERVER'] )) {
            $arrRequest['method'] = 'xvfb';
            (new CurlRequest($_ENV['SCREENSHOT_SERVER']))->post($arrRequest);
        } else {
            if (!isset( $_ENV['SCREENSHOT_CMD'] )) {
                throw new \Exception('Path of screen shooting utility is not configured. Please specify SCREENSHOT_CMD in your .env file');
            }
            $exec = new Executor();
            $strCommand = $_ENV['SCREENSHOT_CMD'] . ' '.$exec->commandLineFromArray($arrRequest). ' --verbose ';
            echo ( $strCommand ).PHP_EOL;
            $exec->runInBackground( $strCommand );
        }
        // Debug::msg( $this );
	return $this;
    }

}