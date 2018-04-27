<?php
namespace Builder\Analytics;


class AnalyticsExport
{

    protected $strIsoStart = '';

    protected $strIsoEnd = '';

    protected $strCompanyName = '';

    protected $strClientName = '';

    public function __construct( $objUser ) {
        $this->objUser = $objUser;
    }

    /**
     * @return AnalyticsEmailsExport
     */
    public function setPeriod( $strStart, $strEnd ) {
        $this->strIsoStart = $strStart;
        $this->strIsoEnd = $strEnd;
        return $this;
    }

    public function setCompanyName( $strName ) {
        $this->strCompanyName = $strName;
        return $this;
    }

    public function setClientName( $strName ) {
        $this->strClientName = $strName;
        return $this;
    }


    public function cleanEmail( $email ) {
        $index = strpos( $email, '=' );
        if ( $index > 0 ) {
            $email = trim(substr( $email, $index + 1 ));
        }
        return $email;
    }

    public function cleanIp( $ip ) {
        return str_replace( '::ffff:', '', $ip );
    }

    public function getDeviceName( $userAgent ) {
        if ( strstr($userAgent, 'iPad') ||
            strstr($userAgent, 'iPod' ) ||
            strstr($userAgent, 'iPhone') ) {
            return 'iOS';
        }
        if ( strstr($userAgent, 'Android') ) {
            return 'Android';
        }
        if ( strstr($userAgent, 'Linux') ) {
            return 'Linux';
        }
        if ( strstr($userAgent, 'Windows') ) {
            return 'Windows';
        }
        return 'Desktop';
    }



}