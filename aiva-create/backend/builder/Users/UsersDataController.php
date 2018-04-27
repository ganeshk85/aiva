<?php namespace Builder\Users;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Database\Query\Expression;
use Builder\Util\DateBreakdown;
use Builder\Util\DateToIso;
use Builder\Projects\PageObjective;
use Builder\Projects\PageModel as Page;
use Builder\Analytics\Report\Builder as ReportBuilder;
use GeoIp2\Database\Reader;
use Builder\Analytics\AnalyticsModel;

class UsersDataController {
    /**
     * Request instance.
     * 
     * @var Symfony\Component\HttpFoundation\Request
     */
    private $request;
    
    private $app;
    
    private $log;

    /**
     * Create new ProjectsController instance.
     * 
     * @param Application $app    
     * @param Request     $request
     */
    public function __construct($app, Request $request, $sentry ) {	
        $this->app = $app;
        $this->log = $app['monolog'];
        $this->sentry = $sentry;
        $this->request = $request;
        $this->input = $request->request;
    }
    
    private function errorResponse( \Exception $e ) {
        $this->log->error( $e->getMessage().' '.$e->getTraceAsString() );
        return new Response( json_encode( array(
            'error' => $e->getMessage()
        ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 500, array(
            'Content-Type' => 'application/json'
        ) );
    }
    
    public function getCampaignProperties( $name ) {
        $objUser = $this->sentry->getUser();
        return new Response( json_encode( array( 
            'campaigns' => $objUser->projects()
                    ->where('name', $name)->get(),
            'email' => $objUser->email
        ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
            'Content-Type' => 'application/json'
        ) );
    }
    
    private function getTriggerTypeName( $type ) 
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
    
    private function getTriggerMeasurement( $type ) 
    {
        if ( $type === 'exitIntent' ) {
            return 'pixels';
        }
        if ( $type === 'scroll' ) {
            return 'percent';
        }
        return 'seconds';
    }
        
    private function filterByDevice( $select, $campaignName, $devices ) {
        // empty name will mean we want all campaigns
        if ( $campaignName ) {
            $arrValues = array();
            if ( $devices !== 'xs' ) {
                $arrValues [] = $campaignName;
            } 
            if ( $devices !== 'lg' ) {
                $arrValues [] = $campaignName.' (Mobile)';
            }
            $select->whereIn( 'name', $arrValues );
        }
        return $select;
    }
    
    /**
     * Called 2 times on analytics screen for selected and previous period
     * The goal of it is to provide # of submissions. 
     * Client should calculate percentage ;)
     * 
     * @param type $name
     * @param type $devices
     * @param type $from
     * @param type $to
     * @return type
     */
    
    private function getNumberOfCampaignSubmissions( $name, $devices, $from, $to ) {
        $from = (new DateToIso($from, 'AUTO'))->get();
        $to =  (new DateToIso($to, 'AUTO'))->get();

        $objUser = $this->sentry->getUser();
        
        $model = new AnalyticsModel;
        $model->setEmail($objUser->email);
        if (!$model->hasData()) {
            throw new \Exception('No Analytics Data Found');
        }
        $select = $model->select( 'name', new Expression('count(*) as submits') )
              ->wheresuccess(1)
              ->where('log_date', '>=', $from . ' 00:00:00' )
              ->where('log_date', '<=', $to . ' 23:59:59' )
              ->groupBy('name');
        $list = $this->filterByDevice($select, $name, $devices)->get();
        $total = 0;
        foreach ( $list as $obj ) {
            $total += $obj->submits;
        }
        return $total;
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
    private function getLocationMapData( $name, $devices, $from, $to ) {
        $from = (new DateToIso($from, 'AUTO'))->get();
        $to =  (new DateToIso($to, 'AUTO'))->get();
        
        $objUser = $this->sentry->getUser();
        
        $model = new AnalyticsModel;
        $model->setEmail($objUser->email);
        
        $file = $this->app['base_dir'].'/backend/storage/GeoLite2-City.mmdb';
        if ( !file_exists( $file ) ) {
             throw new \Exception('GeoLiteCity.dat database not found. Please add database to the backend/storage folder. ' .$file);
        }
        $reader = new Reader($file);
        $select = $model->select( 'ip_addr', new Expression('count(*) as total') )
              ->wheresuccess(1)
              ->where('log_date', '>=', $from . ' 00:00:00' )
              ->where('log_date', '<=', $to . ' 23:59:59' )
              ->groupBy('name')->groupBy('ip_addr');
        $list = $this->filterByDevice($select, $name, $devices)->get();
        $arr = array();
        $mapCountries = array();
        foreach( $list as $obj ) {
            $ip = str_replace( '::ffff:', '', $obj->ip_addr);
            
            try {
                $geodata = $reader->city( $ip );
                $key = implode( '|', array(
                    $geodata->country->isoCode,
                    $geodata->city->name,
                    $geodata->location->latitude,
                    $geodata->location->longitude,
                    $geodata->location->accuracyRadius
                ));
                if ( !isset( $arr[ $key ] )) { 
                    $arr[ $key ] = 0; 
                }
                $arr[ $key ] += $obj->total;
                if ( !isset( $mapCountries[ $geodata->country->name ] )) {
                    $mapCountries[ $geodata->country->name ] = 0;
                }
                $mapCountries[ $geodata->country->name ] += $obj->total;
            } catch( \Exception $e ) {
            }
        }
        ksort( $arr );
        arsort( $mapCountries );
        return array( 'countries' => $mapCountries, 'points' => $arr );
    }
    
    /**
     * Getting all data between 2 days to display analtyics screen from a single request
     * 
     * 
     * @param int $id
     * @param string $devices
     * @param string $from ISO Date 
     * @param string $to ISO Date 
     * @return Response
     * @throws \Exception
     */
    public function getCampaignPeriod( $id, $devices, $from, $to ) {
        $from = (new DateToIso($from, 'AUTO'))->get();
        $to =  (new DateToIso($to, 'AUTO'))->get();
        
        $objUser = $this->sentry->getUser();
        try { 
            $objCampaign = $objUser->projects()->whereproject_id($id)->first();
            if ( !is_object( $objCampaign )) { 
                throw new \Exception('No such campaign or access is not allowed');
            }
            $objPage = Page::wherecta_name( $objCampaign->name )->first();
            if ( !is_object( $objPage )) {
                throw new \Exception('No Analytics Data Found Yet');
            }
            $breakdown = new DateBreakdown();
            $arrPrevious = $breakdown->getPreviousPeriod( $from, $to );
            
            $overlay = json_decode($objPage->overlay_json, true);
            $trigger_type = $overlay['timing']['action'];
            $trigger_value = $overlay['timing']['value'];
            
            return new Response( json_encode( array( 
                'campaign' => $objCampaign,
                'devices' => $devices,
                // 'page' => $objPage,
                'period' => array( 
                    'from' => $from, 'to' => $to, 
                    'submissions' => $this->getNumberOfCampaignSubmissions( $objCampaign->name, $devices, $from, $to ),
                    'objective' => ( is_object( $objPage )) ? (new PageObjective($objPage))->getObjective() : 'Clicks'
                ),
                'previous' => array( 
                    'from' => $arrPrevious[0], 'to' => $arrPrevious[1], 
                    'submissions' => $this->getNumberOfCampaignSubmissions( $objCampaign->name, $devices, $arrPrevious[0], $arrPrevious[1] )
                ),
                'details' => array(
                    'objective' => (new PageObjective( $objPage ))->getName(),
                    'trigger' => array( 
                        'title' => $this->getTriggerTypeName($trigger_type),
                        'value' => $trigger_value,
                        'measure' => $this->getTriggerMeasurement($trigger_type)
                    ),
                    'page' => array( 
                        'title' => ($objPage && $objPage->name != 'index') ? $objPage->name : 'Home',
                        'value' => ($objPage && $objPage->vertical_position) ? $objPage->vertical_position : 'center',
                        'measure' => 'position'
                    ),
                ),
                'series' => $this->mergeSeries( $objCampaign->name, $devices, $from, $to ),
                // 'ip_map' => $this->getIpMapData( $objCampaign->name, $from, $to ),
                'location_map' => $this->getLocationMapData( $objCampaign->name, $devices, $from, $to ),
                
                'email' => $objUser->email
            ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
                'Content-Type' => 'application/json'
            ) );
        
        } catch( \Exception $e ) {
            return $this->errorResponse( $e );
        }
    }
    
    /**
     * Getting Data Series for a weekend that are grouped by every 2 hours.
     * 
     * @param string $id
     * @param string $devices
     * @param string $date ISO Date when week ends
     * @return Response
     * @throws \Exception
     */
    public function getCampaignBreakdown( $id, $devices, $date ) {
        $date = (new DateToIso($date, 'AUTO'))->get();

        $objUser = $this->sentry->getUser();
        $breakdown = new DateBreakdown();
        $dateMinus7 = $breakdown->getFirstDayInAWeek( $date );

        try {
            $objCampaign = $objUser->projects()->whereproject_id($id)->first();
            if ( !is_object( $objCampaign )) { 
                throw new \Exception('no such campaign or access is not allowed');
            }
            $model = new AnalyticsModel;
            $model->setEmail($objUser->email);

            // 2 hours breakdown for 1 week before the given date
            $totals = $model->select( 'name', 'log_date',
                          new Expression('count(*) as submits'),
                          new Expression('DATE(`log_date`) as dt'),
                          new Expression('HOUR(`log_date`) DIV 2 as h2')
                  )
                  
                  ->where('log_date', '>=', $dateMinus7 . ' 00:00:00' )
                  ->where('log_date', '<=', $date . ' 23:59:59' )
                  ->groupBy('name')
                  ->groupBy(new Expression('DATE(log_date)'))
                  ->groupBy(new Expression('HOUR(log_date) DIV 2'));
            $this->filterByDevice( $totals, $objCampaign->name, $devices);
            
            $listTotals = $totals->get();
            $listSubmits = $totals->wheresuccess(1)->get();
            
            return new Response( json_encode( array( 
                'campaign' => $objCampaign,
                'devices' => $devices,
                'submits' => $listSubmits,
                'totals' => $listTotals,
                'date' => $date,
                'dateMinus7' => $dateMinus7,
                'email' => $objUser->email
            ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
                'Content-Type' => 'application/json'
            )); 
        } catch( \Exception $e ) {
            return $this->errorResponse( $e );
        }
    }
    
    /**
     * Getting list of campaigns to display them in selection for analytics screen
     * 
     * @return Response
     */
    public function campaigns() {
        $objUser = $this->sentry->getUser();
        return new Response( json_encode( array( 
            'campaigns' => $objUser->projects()->get(array( 'name', 'client') ),
            'email' => $objUser->email
        ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
            'Content-Type' => 'application/json'
        ) );
    }

    /**
     * Get # of submissions for certain period. 
     * there will be 2 calls to that function. 1st to get total submissions, 
     * 2nd to get just successfull.
     * 
     * @param string $name
     * @param string $devices
     * @param string $from  ISO date
     * @param string $to    ISO date
     * @param string $type  success | score | total
     * @return array
     */
    protected function getSubmissionSeries($name, $devices, $from, $to, $type  ) {
        $objUser = $this->sentry->getUser();

        $model = new AnalyticsModel;
        $model->setEmail($objUser->email);

        $select = $model
            ->select( 'name',
                new Expression('count(*) as value'),
                new Expression('DATE(`log_date`) as dt')
            )
            ->where('log_date', '>=', $from . ' 00:00:00' )
            ->where('log_date', '<=', $to . ' 23:59:59' )
            ->groupBy('name')
            ->groupBy(new Expression('DATE(log_date)'));
       if ( $type == 'success' ) {
           $select->wheresuccess( 1 );
       } 
       return $this->filterByDevice($select, $name, $devices )->get();
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
    protected function mergeSeries( $name, $devices, $from, $to )
    {
        $arrResult = array();
        $arrTotals = $this->getSubmissionSeries($name, $devices, $from, $to, 'totals' );
        $arrSuccess = $this->getSubmissionSeries($name, $devices, $from, $to, 'success' );
        
        // echo '<pre>';  print_r( $arrTotals->toArray() ); echo '</pre>';
        // echo '<pre>';  print_r( $arrSuccess->toArray() ); echo '</pre>';
        // \Builder\Util\Debug::msg( [ 'totals' => $arrTotals->toArray(), 'success' => $arrSuccess->toArray() ] );
        foreach ($arrTotals as $row ) {
            $cName = strtolower( preg_replace( '/\s+\(Mobile\)$/i', '', $row['name']));
            $data = array( 'dt' => $row['dt'], 'total' => $row['value'] );
            
//            if ( $row['dt'] == '2017-01-07' ) {
//                echo $cName.' - '. $row['dt']. ' '.$data['total']. PHP_EOL;
//                echo 'before '.print_r( $arrResult, true ).PHP_EOL;
//            }
            
            if ( $name == '' ) {
                if ( !isset( $arrResult[ $cName ] )) { 
                    $arrResult[ $cName ] = array(); 
                }
                if ( !isset( $arrResult[ $cName ] [ $row['dt'] ] ) ) { 
                    $arrResult[ $cName ] [ $row['dt'] ] = array( 'dt' => $row['dt'], 'total' => $data['total'], 'success' => 0 );
                } else {
                    // print_r($arrResult[ $cName ] [ $row['dt'] ]);
                    $arrResult[ $cName ] [ $row['dt'] ]['total'] += $data['total']; 
                }
            } else { 
                if (! isset($arrResult[ $row['dt'] ])) {
                    $arrResult[ $row['dt'] ] = $data;
                } else {
                    $arrResult[ $row['dt'] ] += $data;
                }
            }
        }
        // \Builder\Util\Debug::msg( [ $name, $arrResult ] );
        foreach ($arrSuccess as $row ) {
            $cName = strtolower(preg_replace( '/\s+\(Mobile\)$/i', '', $row['name']));
            $data = $row['value'];
            if ( $name == '' ) {
                if ( !isset( $arrResult[ $cName ][ $row['dt'] ]['success'] )) {
                    $arrResult[ $cName ][ $row['dt'] ]['success'] = $data;
                } else {
                    $arrResult[ $cName ][ $row['dt'] ]['success'] += $data;
                }
            } else {
                if ( !isset($arrResult[ $row['dt'] ]['success'])) {
                    $arrResult[ $row['dt'] ]['success'] = $data;
                } else {
                    $arrResult[ $row['dt'] ]['success'] += $data;
                }
            }
        }
        if ( $name == '' ) {
            foreach ( $arrResult as $name => $val ) {
                $arrResult[$name] = array_values( $val );
            }
        } else {
            ksort( $arrResult );
            return array_values( $arrResult );
        }
        return $arrResult;
    }
    
    /**
     * Getting # of submissions for every campaign.
     * Used to display on campaigns screen
     * 
     * @return Response
     */
    public function submissions() {
        $objUser = $this->sentry->getUser();
        try{ 
            $model = new AnalyticsModel;
            $model->setEmail($objUser->email);

            $list = $model
                    ->select( 'name', 
                              new Expression('count(*) as total'))
                    ->wheresuccess(1)
                    ->groupBy('name')
                    ->get();
            // as the list above contains the list from both campaigns, 
            // we need to merge records that are doubled
            $arrMap = array();
            foreach ( $list as $val ) {
                $name = strtolower(preg_replace( '/\s+\(Mobile\)$/i', '', $val['name']));
                // echo 'name=\''.$name.'\''.PHP_EOL;
                if ( isset( $arrMap[ $name ] ) ) {
                    $arrMap[ $name ]['total'] += $val['total'];
                    // $objPage = Page::wherecta_name( $val['name'] )->first();
                    // $arrMap[ $val['name'] ]['objective'] = ( is_object( $objPage )) ? 
                       //      (new PageObjective($objPage))->getObjective() : 'Clicks';
                } else {
                    $arrMap[ $name ] = array( 'name' => $name, 'total' => $val['total']);
                }
            }
            
            foreach ( $arrMap as $campaign => $val ) {
                $objPage = Page::wherecta_name( $campaign )->first();
                $arrMap[ $campaign ]['objective'] = ( is_object( $objPage )) ? 
                            (new PageObjective($objPage))->getObjective() : 'Clicks';
            }
            
            // for every user's campaign, show number of submissions
            return new Response( json_encode( array( 
                'submissions' => array_values($arrMap),
                'server_time' => date('Y-m-d H:i:s'),
                'email' => $objUser->email
            ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
                'Content-Type' => 'application/json'
            ) );
        } catch( \Exception $e ) {
            return $this->errorResponse( $e );
        }
    }
    
    /**
     * Getting totals and successes groupped by date
     * Used to display on small campaign health chart
     * 
     * @return Response
     */
    public function seriesHealth() {
        $objUser = $this->sentry->getUser();
        try { 
            $model = new AnalyticsModel;
            $model->setEmail($objUser->email);

            // groupped by project and  date interval
            $series = $this->mergeSeries( '', 'all', date( 'Y-m-d', strtotime( '-7 days') ), date( 'Y-m-d' ) );
            return new Response( json_encode( array( 
                'email' => $objUser->email,
                'series' => $series,
            ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
                'Content-Type' => 'application/json'
            ) );

         } catch( \Exception $e ) {
            return $this->errorResponse( $e );
        }
    }
    
    public function buildReport($from, $to, $campaigns, $metrics, Request $req) {
        set_time_limit(0);
        
        $fromIso = (new DateToIso($from, 'AUTO'))->get();
        $toIso =  (new DateToIso($to, 'AUTO'))->get();
        $objUser = $this->sentry->getUser();
        $objUser->auto_generate = $req->get('auto_generate');
        $objUser->save();        
        
        $model = new AnalyticsModel;
        $model->setEmail($objUser->email);
        
        $report = (new ReportBuilder($objUser, $model, $fromIso, $toIso))
                ->setBrandColor($req->get('color'))
                ->setCampaigns($campaigns)
                ->setMetrics($metrics)
                ->build()->download();

        // return new Response('ok', 200);
    }
}