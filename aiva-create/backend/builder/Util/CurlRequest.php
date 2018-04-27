<?php namespace Builder\Util;

class CurlRequest {

    public $ConnectTimeout  = 30;
    public $DownloadTimeout = 120;
    
    protected $url;
    protected $curl;
    
    function __construct($strServerUrl) {
        $this->url = $strServerUrl;
    }
    
    public function post( array $arrPostParams ) {
        $this->curl = curl_init($this->url);
        $body = json_encode($arrPostParams);
        curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
        curl_setopt($this->curl, CURLOPT_POSTFIELDS, $body);
        curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($this->curl, CURLOPT_CONNECTTIMEOUT,   $this->ConnectTimeout );
        curl_setopt($this->curl, CURLOPT_TIMEOUT,          $this->DownloadTimeout );
        curl_setopt($this->curl, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            // 'Content-Length : '.strlen($body) 
        ));
        return $this->getResponse();
    }

    public function get() {
        $this->curl = curl_init($this->url);
        curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($this->curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($this->curl, CURLOPT_CONNECTTIMEOUT,   $this->ConnectTimeout );
        curl_setopt($this->curl, CURLOPT_TIMEOUT,          $this->DownloadTimeout );
        return $this->getResponse();
    }
    
    protected function getResponse() {
        curl_setopt($this->curl, CURLOPT_USERAGENT, "AivaLabs PageCheck Bot/1.0");

        $response = curl_exec($this->curl);
        $errorMsg = curl_error($this->curl);
        $errorNumber = curl_errno($this->curl);
        if ($errorNumber) {
            throw new \Exception('Server request error: ' . $errorMsg );
        }
        $info = curl_getinfo($this->curl);
        if ($info['http_code'] >= 300) {
            throw new \Exception('HTTP Status of response is ' . $info['http_code']
                    .', 200 expected. Please use valid URL' );
        }
        curl_close($this->curl);
        return $response;
    }
    
}