<?php namespace Builder\Exports;

class YoutubeThumb
{
    protected $_strVideoUrl;

    public function __construct( $strUrl )
    {
        $this->_strVideoUrl = $strUrl;
        return $this;
    }

    /** @return string */
    public function getId() {
        $m = array();
        $arrMatches = array(
            '@://www\.youtube\.com/embed/([-\w]+)$@simU',
            '@://www\.youtube\.com/embed/([-\w]+)\?@simU',
            '@://www\.youtube\.com/watch\?v=([-\w]+)\&@simU',
        );
        foreach ( $arrMatches as $strPattern )  {
            if (preg_match($strPattern, $this->_strVideoUrl, $m) ) {
                return $m[1];
            }
        }
        return $c;
    }
    
    public function getThumbnailUrl() {
        if (!$this->getId()) {
            throw new \Exception('No video ID was extracted');
        }
        return 'https://img.youtube.com/vi/'. $this->getId(). '/0.jpg';
    }
}