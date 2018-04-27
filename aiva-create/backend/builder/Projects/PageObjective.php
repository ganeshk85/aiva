<?php namespace Builder\Projects;

class PageObjective {
    
    protected $objPage = null;
    
    protected $doc = null;
    
    protected function cleanHtml($html) {
        return str_replace( '<head></head>', '', $html );
    }
    
    public function __construct( $objPage ) {
        if (is_object($objPage)) {
            $this->objPage = $objPage;
            if ( !$this->objPage->html ) {
                throw new \Exception('Cannot detect Page objective from empty HTML object');
            }
            $this->doc = \phpQuery::newDocument($this->cleanHtml($this->objPage->html));
        } else if (is_string($objPage)) {
            if ( !$objPage ) {
                throw new \Exception('Cannot detect Page objective from empty HTML string');
            }
            $this->doc = \phpQuery::newDocument($this->cleanHtml($objPage));
        }
        \phpQuery::selectDocument($this->doc);
    }

    /**
     * this function is left for debugging of \DOMElement
     * 
     * @param \DOMElement $e
     * @return type
     */
    private function outerHTML(\DOMElement $e) {
        $doc = new \DOMDocument();
        $doc->appendChild($doc->importNode($e, true));
        return $doc->saveHTML();
    }
    
    //TO DO add all actionable elements
    public function hasSubmitElements() {
        foreach ( pq('button, input, img, div')->elements as $el ) {
            if ($el->tagName == 'input') {
                if ($el->getAttribute('data-name')) return true;
            } else {
                if ($el->getAttribute('type') == 'submit') return true;
            }
        // echo htmlspecialchars( $this->outerHTML( $el ) ).'<br />;
        }
        return false;
    }
    
    public function getName() {
        // \Builder\Util\Debug::msg($doc);
        return 'Maximize '. ($this->hasSubmitElements() ? 'Submissions' : 'Clickthrough');
    }
   
    public function getObjective() {
        // \Builder\Util\Debug::msg($doc);
        return ($this->hasSubmitElements() ? 'Submissions' : 'Clicks');
    }
}
