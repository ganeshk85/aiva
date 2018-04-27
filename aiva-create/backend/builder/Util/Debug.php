<?php
namespace Builder\Util;

class Debug {

    public static function msg( $sContent, $strPath = '' )
    {
        $serverUrl = 'http://127.0.0.1:6789/'.$strPath;
        $sMsg = print_r( $sContent, true  );

        $curl = curl_init();
        if( $curl ) {
            curl_setopt($curl, CURLOPT_URL, $serverUrl );
            curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 2 );
            curl_setopt($curl, CURLOPT_TIMEOUT, 5 );
            curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $sMsg );
            $out = curl_exec($curl);
            curl_close($curl);
        }
        return "";
    }
}
