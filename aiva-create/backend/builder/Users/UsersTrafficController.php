<?php namespace Builder\Users;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Database\Query\Expression;
use Builder\Util\DateToIso;
use Builder\Util\DateBreakdown;
use Builder\Projects\PageModel as Page;
use Builder\Projects\ProjectModel;
use GeoIp2\Database\Reader;
use Builder\Analytics\AnalyticsEmailsExport;
use Builder\Analytics\AnalyticsTrafficExport;

class UsersTrafficController {
    /**
     * Request instance.
     * 
     * @var Symfony\Component\HttpFoundation\Request
     */
    private $request;
    
    /**
     * @var Symfony\Component\HttpFoundation\ParameterBag
     */
    private $input;
    /**
     * @var Symfony\Component\HttpFoundation\ParameterBag
     */
    private $query;
    
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
        $this->query = $request->query;
    }
    
    private function errorResponse( \Exception $e ) {
        $this->log->error( $e->getMessage().' '.$e->getTraceAsString() );
        return new Response( json_encode( array(
            'error' => $e->getMessage()
        ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 500, array(
            'Content-Type' => 'application/json'
        ) );
    }
    
    private function urlsDataResponse( $arrFilter = array() ) {
        $objUser = $this->sentry->getUser();
        try { 
            $model = new \Builder\Analytics\AnalyticsModel;
            $model->setEmail($objUser->email);
            if (!$model->hasData()) {
                throw new \Exception('No Analytics Data Found');
            }
            $select = $model
                ->select( 'log_date', 'name', 
                        new Expression( 'REPLACE(url,\'URL = \',\'\') as url' ), 
                        'text_collected' )
                ->where( 'url', '<>', '' )
                ->orderBy('log_date', 'DESC');
            if ( isset( $arrFilter['name'] ) && is_array( $arrFilter['name'] )) {
                $select->whereIn( 'name', $arrFilter['name'] );
            }
            return new Response( json_encode( array( 
                'email' => $objUser->email,
                'filter' => $arrFilter,
                'urls' => $select->get(),
            ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
                'Content-Type' => 'application/json'
            ) );
         } catch( \Exception $e ) {
            return $this->errorResponse( $e );
        }
    }
    
    private function emailsDataResponse( $arrFilter = array() ) {
        $objUser = $this->sentry->getUser();
        try { 
            $model = new \Builder\Analytics\AnalyticsModel;
            $model->setEmail($objUser->email);
            if (!$model->hasData()) {
                throw new \Exception('No Analytics Data Found');
            }
            $select = $model
                ->select( 'log_date', 'name', 
                        new Expression( 'REPLACE(email,\'Email = \',\'\') as email' ), 
                        'text_collected' )
                ->where( 'email', '<>', '' )
                ->orderBy('log_date', 'DESC');
            if ( isset( $arrFilter['name'] ) && is_array( $arrFilter['name'] )) {
                $select->whereIn( 'name', $arrFilter['name'] );
            }
            return new Response( json_encode( array( 
                'email' => $objUser->email,
                'filter' => $arrFilter,
                'emails' => $select->get(),
            ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
                'Content-Type' => 'application/json'
            ) );
         } catch( \Exception $e ) {
            return $this->errorResponse( $e );
        }
    }
    
    private function trafficDataResponse( $arrFilter = array() ) {
        $objUser = $this->sentry->getUser();
        try { 
            $model = new \Builder\Analytics\AnalyticsModel;
            $model->setEmail($objUser->email);
            if (!$model->hasData()) {
                throw new \Exception('No Analytics Data Found');
            }
            $select = $model
                ->select( 
                    'log_date', 'ip_addr', 'elapsed_time', 'location', 
                    'name', 'device', 'prev_site', 'curr_site',
                    new Expression( 'REPLACE(url,\'URL = \',\'\') as url' ), 
                    new Expression( 'REPLACE(email,\'Email = \',\'\') as email' ), 
                    'text_collected', 'submit_value', 'cta', 'score', 'success'
                )
                ->orderBy('log_date', 'DESC');

            $arrCampaignNames = array();
            if ( isset( $arrFilter['client'] ) && $arrFilter['client'] ) {
                $lstProjects = ProjectModel::where('client', $arrFilter['client'] )->get();
                foreach ( $lstProjects as $objProj ) {
                    $arrCampaignNames[] = $objProj->name;
                    $arrCampaignNames[] = $objProj->name.' (Mobile)';
                }
            } else if ( isset( $arrFilter['name'] ) && is_array( $arrFilter['name'] )) {
                $arrCampaignNames = $arrFilter['name'];
            }
            if ( count( $arrCampaignNames )) {
                $select->whereIn( 'name', $arrCampaignNames );
            }
            
            return new Response( json_encode( array( 
                'email' => $objUser->email,
                'filter' => $arrFilter,
                'campaigns' => $arrCampaignNames,
                'traffic' => $select->get(),
            ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 200, array(
                'Content-Type' => 'application/json'
            ) );
         } catch( \Exception $e ) {
            return $this->errorResponse( $e );
        }
    }
    
    /**
     * @return Response
     */
    public function emails() {
        return $this->emailsDataResponse();
    }
    
     /**
     * @return Response
     */
    public function emailsByCampaign($name) {
         return $this->emailsDataResponse(array( 'name' => array( $name, $name.' (Mobile)' ) ));
    }
    
    /**
     * @return Response
     */
    public function urls() {
        return $this->urlsDataResponse();
    }
    
     /**
     * @return Response
     */
    public function urlsByCampaign($name) {
         return $this->urlsDataResponse(array( 'name' => array( $name, $name.' (Mobile)' ) ));
    }
    
    /**
     * @return Response
     */
    public function traffic() {
        return $this->trafficDataResponse();
    }
    
     /**
     * @return Response
     */
    public function trafficByCampaign( $name ) {
        return $this->trafficDataResponse(array( 'name' => array( $name, $name.' (Mobile)' ) ));
    }
    
     /**
     * @return Response
     */
    public function trafficByClient( $name ) {
        return $this->trafficDataResponse(array( 'client' => $name ) );
    }
    
    /**
     * @return Response
     */
    public function export() {
        $objUser = $this->sentry->getUser();
        
        if ( $this->query->get('dataSource') === 'emails' ) {
            $export = new AnalyticsEmailsExport($objUser);
        } else if ( $this->query->get('dataSource') === 'traffic' ) {
            $export = new AnalyticsTrafficExport($objUser);
        } else {
            throw new \Exception('Invalid Data Source');
        }
        
        $isoStart = (new DateToIso( $this->query->get('startDate'), $this->query->get('dateFormat')))->get();
        $isoEnd = (new DateToIso( $this->query->get('endDate'), $this->query->get('dateFormat')))->get();
        
        $export->setPeriod( $isoStart, $isoEnd );
        return $export->getCsv();
    }
}
