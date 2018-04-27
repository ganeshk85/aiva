<?php namespace Builder\Util;

class DateToIso {
    
    protected $strFormat = '';
    protected $strOriginal = '';
    protected $strIso = '';
    
    protected function detectFormat($strDate) {
        if (strpos($strDate, '.')) { return 'DD.MM.YYYY'; }
        if (strpos($strDate, '-')) { return 'YYYY-MM-DD'; }
        if (strpos($strDate, '/')) { return 'MM/DD/YYYY'; }
        if (strlen($strDate) === 8 ) { return 'YYYYMMDD'; }
        throw new \Exception( 'Unkdown date format '.$strDate );
    }

    public function __construct( $strDate, $strFormat = 'YYYY-MM-DD' ) {
        $this->strFormat = $strFormat;
        $this->strOriginal = $strDate;
        if ( $strFormat === 'AUTO') {
            $this->strFormat = $this->detectFormat($strDate);
        }
        
        $arrToPhpFormat = array(
            'YYYY' => 'Y', 'MM' => 'm', 'DD' => 'd'
        );
        foreach ( $arrToPhpFormat as $key => $val ) {
            $this->strFormat = str_replace( $key, $val, $this->strFormat );
        }
        $arrDt = date_parse_from_format( $this->strFormat , $strDate );
        if (isset($arrDt['error_count']) && $arrDt['error_count'] > 0) {
            throw new \Exception( $this->getNiceError( $arrDt) );
        }
        $this->strIso = implode( '-', array(
            sprintf( '%04d', $arrDt['year'] ),
            sprintf( '%02d', $arrDt['month'] ),
            sprintf( '%02d', $arrDt['day'] )
        ));
    }
    
    public function get() {
        return $this->strIso;
    }
    
    protected function getNiceError( array $arr ) {
        $start = 'Invalid date '.$this->strOriginal.' ('.$this->strFormat.')';
        if ( isset( $arr['errors'] ) && count($arr['errors']) > 0 && isset( $arr['errors'][0] ) ) {
            return $start . ' '. $arr['errors'][0];
        }
        return $start;
    }
}