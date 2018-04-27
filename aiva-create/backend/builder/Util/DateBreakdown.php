<?php namespace Builder\Util;

class DateBreakdown
{
    public function getFirstDayInAWeek( $strIso ) {
        $time = strtotime($strIso);
        $date = strtotime('-6 day', $time);
        return date('Y-m-d', $date);
    }
    
    public function getPreviousPeriod( $strIsoFrom, $strIsoTo ) {
        $time = strtotime($strIsoFrom);
        $timeTo = strtotime('-1 day', $time);
        
        $date1 = new \DateTime($strIsoFrom);
        $date2 = new \DateTime($strIsoTo);
        $nDays = $date2->diff($date1)->format('%a');
        
        $timeFrom = strtotime( '-' . $nDays.' days', $timeTo);
        $isoTo = date('Y-m-d', $timeTo );
        $isoFrom = date( 'Y-m-d', $timeFrom );
        return array( $isoFrom, $isoTo );
    }
    
    public function getPeriodBetween( $strIsoDt1, $strIsoDt2 ) {
        $strFormat = 'Y-m-d';
        if ($strIsoDt1 > $strIsoDt2) {
            $t = $strIsoDt1; $strIsoDt1 = $strIsoDt2; $strIsoDt2 = $t;
        }
        $dtCurrent = date ( 'Y-m-d', strtotime ( $strIsoDt1 ) );
        $arrDates = array ();
        while ( $dtCurrent <= $strIsoDt2 ) {
            $arrDates [$dtCurrent] = date ( $strFormat, strtotime ( $dtCurrent ) );
            $dtCurrent = date ( 'Y-m-d', strtotime ( $dtCurrent ) + 25 * 60 * 60 );
        }
        return $arrDates;
    }
}