<?php namespace Builder\Analytics;

use Builder\Projects\PageModel as Page;
use Builder\Projects\PageObjective;
use Illuminate\Database\Query\Expression;
use GeoIp2\Database\Reader;

class AnalyticsData {

    /* @var Builder\Analytics\AnalyticsModel */
    protected $model;
    /* @var string */
    protected $name;
    
    public $isoCountryCodes = array();
    
    public function __construct( $model, $campaign, $from, $to ) {
        global $app;
        $this->model = $model;
        $this->campaign = $campaign;
        $this->from = $from;
        $this->to = $to;
        $this->name = $this->campaign->name;
        $this->page = Page::wherecta_name( $this->campaign->name )->first();
        if ( !is_object( $this->page )) {
            throw new \Exception('No Analytics Data Found Yet');
        }
        $this->po = new PageObjective($this->page);
        
        $file = $app['base_dir'].'/backend/storage/GeoLite2-City.mmdb';
        if ( !file_exists( $file ) ) {
             throw new \Exception('GeoLiteCity.dat database not found. Please add database to the backend/storage folder. ' .$file);
        }
        $this->reader = new Reader($file);
    }
    
    public function getThumbnailPath() {
        global $app;
        return $app['base_dir'] . '/assets/images/projects/project-' . $this->campaign->id . '-thumb.png';
    }
            
    public function getPage() { 
        return $this->page; 
    }
    
    public function getFrom() {
        return $this->from;
    }
        
    public function getWeekStart() {
        return date('Y-m-d', strtotime( '-7 days', strtotime($this->to)));
    }
    
    public function getDays() {
        $tmFrom = new \DateTime($this->getFrom());
        $tmTo = new \DateTime( $this->getTo());
        return $tmTo->diff($tmFrom)->format("%a");
    }    
        
    public function prevWeek() {
        return array(
            date('Y-m-d', strtotime( '-'.$this->getDays().' days', strtotime($this->from))),
            date('Y-m-d', strtotime( '-1 day', strtotime($this->from)))
        );
    }

    public function thisWeek() {
        return array(
            $this->from,
            $this->to
        );
    }
    
    public function getTo() {
        return $this->to;
    }
    
    public function getPagePosition() {
        return (is_object($this->page) && $this->page->vertical_position) ? $this->page->vertical_position : 'center';
    }
    
    public function getCampaignObjectiveName() {
        return (is_object($this->page)) ? $this->po->getName() : 'Maximize Clickthrough';
    }
    
    public function getActionNames() {
        return $this->po->hasSubmitElements() ? 'Emails Submitted' : 'URLs Clicked';
    }
    
    public function hasSubmissions() {
        return $this->po->hasSubmitElements();
    }
    
    public function getCountryCode( $countryName ) {
        return isset( $this->isoCountryCodes[ $countryName ] ) ? $this->isoCountryCodes[ $countryName ] : $countryName;
    }
    
    public function getCampaignPageName() {
        return (is_object($this->page) && $this->page->name != 'index') ? $this->page->name : 'Home';
    }
    
    public function getTriggerTypeName( $type ) 
    {
        if ( $type === 'exitIntent' ) {
            return 'Exit Intent';
        }
        if ( $type === 'scroll' ) {
            return 'Scroll';
        }
        if ( $type === 'adblock' ) {
            return 'Ad Block';
        }
        return 'Time on Page';
    }
    
    public function getTriggerMeasurement( $type ) 
    {
        if ( $type === 'exitIntent' ) {
            return 'pixels';
        }
        if ( $type === 'scroll' ) {
            return 'percent';
        }
        return 'seconds';
    }
    
    public function filterByDevice( $select, $campaignName, $devices ) {
        // empty name will mean we want all campaigns
        // echo '<pre style="color:green">'.$select->toSql().'</pre>';
        if ( $campaignName ) {
            $arrValues = array();
            if ( !is_string($devices) || $devices !== 'xs' ) {
                $arrValues [] = $campaignName;
            } 
            if ( !is_string($devices) || $devices !== 'lg' ) {
                $arrValues [] = $campaignName.' (Mobile)';
            }
            $select->whereIn( 'name', $arrValues );
        }
        if (is_array($devices)) {
            // echo '<pre style="color:red">'.$select->toSql().'</pre>';
            foreach( $devices as $key => $value ) {
                $select->where($key, 'LIKE', $value.'%');
            }
        }
        // echo '<pre>'.$select->toSql().'</pre>';
        return $select;
    }
    
    /**
     * @param string $devices
     * @return type
     */
    public function getNumberOfCampaignSubmissions( $devices = '' ) {
        $select = $this->model->select( 'name', new Expression('count(*) as submits') )
              ->wheresuccess(1)
              ->where('log_date', '>=', $this->getFrom() . ' 00:00:00' )
              ->where('log_date', '<=', $this->getTo(). ' 23:59:59' )
              ->groupBy('name');
        $list = $this->filterByDevice($select, $this->name, $devices)->get();
        $total = 0;
        foreach ( $list as $obj ) { $total += $obj->submits; }
        return $total;
    }
    
    public function getNumberOfCampaignTotals( $devices = '' ) {
        $select = $this->model->select( 'name', new Expression('count(*) as totals') )
              ->where('log_date', '>=', $this->getFrom() . ' 00:00:00' )
              ->where('log_date', '<=', $this->getTo(). ' 23:59:59' )
              ->groupBy('name');
        $list = $this->filterByDevice($select, $this->name, $devices)->get();
        $total = 0;
        foreach ( $list as $obj ) { $total += $obj->totals; }
        return $total;
    }
 
    public function getSuccessRate($devices = '') {
        $totals = $this->getNumberOfCampaignTotals( $devices );
        $success = $this->getNumberOfCampaignSubmissions( $devices );
        // die( print_r( array( 'totals' => $totals, 'success' => $success) ));
        if ($totals <= 0) { return 0; }
        return intval($success * 100 / $totals);
    }
    
    public function getImpressions($devices = '') {
        return $this->getNumberOfCampaignTotals( $devices );
    }
    
    public function getBreakdown($devices = '') {
        // 2 hours breakdown for 1 week before the given date
        // die( print_r( [ $this->getWeekStart(), $this->getTo() ] ));
        $totals = $this->model->select( 
                'name', 'log_date',
                new Expression('count(*) as submits'),
                new Expression('DATE(`log_date`) as dt'),
                new Expression('2*(HOUR(`log_date`) DIV 2) as h2')
            )
            ->where('log_date', '>=', $this->getWeekStart() . ' 00:00:00' )
            ->where('log_date', '<=', $this->getTo() . ' 23:59:59' )
            ->groupBy('name')
            ->groupBy(new Expression('DATE(log_date)'))
            ->groupBy(new Expression('HOUR(log_date) DIV 2'));
        $this->filterByDevice( $totals, $this->name, $devices);
        
        $all = $totals->get();
        $success = $totals->wheresuccess(1)->get();
        $breakdown = array();
        foreach ( $all as $arr ) {
            $index = $arr['dt'].'T'.sprintf('%02d', $arr['h2']);
            // echo $index . ' *** '.print_r( $arr->toArray(), true ).'<br />';
            if (!isset($breakdown[$index])) {
                $breakdown[$index] = array( 'totals' => $arr['submits'] );
            } else {
                $breakdown[$index]['totals'] += $arr['submits'];
            }
            // echo '<span style="color:red"> '. print_r( $breakdown, true ). '</span><br />';
        }
        foreach ( $success as $arr ) {
            $index = $arr['dt'].'T'.sprintf('%02d', $arr['h2']);
            if (!isset($breakdown[$index]['success'])) {
                $breakdown[$index]['success'] = $arr['submits'];
            } else {
                $breakdown[$index]['success'] += $arr['submits'];
            }
        }
        // echo '<pre>'; print_r($breakdown ); echo '</pre>';
        return $breakdown;
    }
    
    /**
     * Getting data to be displayed on location map
     * 
     * @param type $name
     * @param type $devices
     * @param type $from
     * @param type $to
     * @return type
     * @throws \Exception
     */
    public function getLocationMapData( $devices, $from = '', $to ='' ) {
        // if no period is provided, take the period of the campaign report
        if ($from == '') { $from = $this->getFrom(); }
        if ($to == '') { $to = $this->getTo(); } 
        
        $select = $this->model->select( 'ip_addr', 'success', new Expression('count(*) as total') )
              ->where('log_date', '>=', $from . ' 00:00:00' )
              ->where('log_date', '<=', $to . ' 23:59:59' )
              ->groupBy('success')->groupBy('name')->groupBy('ip_addr');
        $list = $this->filterByDevice($select, $this->name, $devices)->get();
        $arr = array();
        $mapCountries = array();
        $arrSeries = array();
        foreach( $list as $obj ) {
            $ip = str_replace( '::ffff:', '', $obj->ip_addr);
            try {
                $geodata = $this->reader->city( $ip );
                $this->isoCountryCodes[ $geodata->country->name ] = $geodata->country->isoCode;
                
                if ( !isset( $mapCountries[ $geodata->country->name ] )) {
                    $mapCountries[ $geodata->country->name ] = array('total' => 0,'success' => 0);
                }
                $mapCountries[ $geodata->country->name ]['total'] += $obj->total;
                if ($obj->success) {
                    $mapCountries[ $geodata->country->name ]['success'] += $obj->total;
                }
                $arrSeries[ $geodata->country->isoCode ] = $this->mergeSeries( '', $geodata->country->isoCode );
            } catch( \Exception $e ) {
            }
        }
        ksort( $arr );
        arsort( $mapCountries );
        return array( 'countries' => $mapCountries, 'series' => $arrSeries );
    }
    
    /**
     * @param string $devices
     * @param string $type  success | score | total
     * @return array
     */
    public  function getSubmissionSeries($devices, $type, $isoCountry = '') {
        $select = $this->model
            ->select( 'name',
                new Expression('count(*) as value'),
                new Expression('DATE(`log_date`) as dt')
            )
            ->where('log_date', '>=', $this->getFrom() . ' 00:00:00' )
            ->where('log_date', '<=', $this->getTo() . ' 23:59:59' )
            ->groupBy('name')
            ->groupBy(new Expression('DATE(log_date)'));
       if ( $type == 'success' ) {
           $select->wheresuccess( 1 );
       } 
       if ( $isoCountry ) {
           $select->wherelocation($isoCountry);
       }
       return $this->filterByDevice($select, $this->name, $devices )->get();
    }
    
    /**
     * Merging searies from multiple requests by date 
     * and turning them into single array, each date will be a separate item
     * 
     * @param string $name
     * @param string $devices
     * @param string $from  ISO Date
     * @param string $to    ISO Date
     * @return array
     */
    public function mergeSeries( $devices, $isoCountry = '' )
    {
        $arrResult = array();
        $arrTotals = $this->getSubmissionSeries($devices, 'totals', $isoCountry);
        $arrSuccess = $this->getSubmissionSeries($devices, 'success', $isoCountry);
        
        // echo '<pre>';  print_r( $arrTotals->toArray() ); echo '</pre>';
        // echo '<pre>';  print_r( $arrSuccess->toArray() ); echo '</pre>';
        // \Builder\Util\Debug::msg( [ 'totals' => $arrTotals->toArray(), 'success' => $arrSuccess->toArray() ] );
        foreach ($arrTotals as $row ) {
            $cName = strtolower( preg_replace( '/\s+\(Mobile\)$/i', '', $row['name']));
            $data = array( 'dt' => $row['dt'], 'total' => $row['value'] );
            if (! isset($arrResult[ $row['dt'] ])) {
                $arrResult[ $row['dt'] ] = $data;
            } else {
                $arrResult[ $row['dt'] ]['total'] += $row['value'];
            }
        }
        // \Builder\Util\Debug::msg( [ $name, $arrResult ] );
        foreach ($arrSuccess as $row ) {
            $cName = strtolower(preg_replace( '/\s+\(Mobile\)$/i', '', $row['name']));
            $data = $row['value'];
            if ( !isset($arrResult[ $row['dt'] ]['success'])) {
                $arrResult[ $row['dt'] ]['success'] = $data;
            } else {
                $arrResult[ $row['dt'] ]['success'] += $data;
            }
        }
        ksort( $arrResult );
        return array_values( $arrResult );
    }
        
    public function getTotalsAsMap( $list ) {
        $arr = array();
        foreach ( $list as $record ) {
            if (isset($record['total'])) {
                $arr[$record['dt']] = $record['total'];
            }
        }
        return $arr;
    }
    
    public function getSubmitsAsMap( $list ) {
        $arr = array();
        foreach ( $list as $record ) {
            if (isset($record['success'])) {
                $arr[$record['dt']] = $record['success'];
            }
        }
        return $arr;
    }
    
    public function getСtrAsMap( $list ) {
        $arr = array();
        foreach ( $list as $record ) {
            if (isset($record['success'])) {
                $arr[$record['dt']] = round( $record['success'] * 100.0 / (float)$record['total'], 2);
            }
        }
        return $arr;
    }
    
    public function getMaxInSeries( $map, $default) {
        $max = -1;
        foreach ( $map as $val ) {
            if ( $val > $max ) { $max = $val; }
        }
        return $max == -1 ? $default : $max;
    }
}