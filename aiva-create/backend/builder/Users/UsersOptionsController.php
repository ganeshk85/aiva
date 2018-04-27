<?php namespace Builder\Users;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UsersOptionsController {
    /**
     * Request instance.
     * 
     * @var Symfony\Component\HttpFoundation\Request
     */
    private $request;

    /**
     * Paramater bag instance.
     * 
     * @var Symfony\Component\HttpFoundation\ParameterBag
     */
    private $input;

    /**
     * @var UserOptionsModel
     */
    private $model;

    private $app;

    /**
     * Create new UsersOptionsController instance.
     * 
     * @param Application $app    
     * @param Request     $request
     */
    public function __construct($app, Request $request, $sentry, 
                                 UsersOptionsModel $model) {
        $this->app = $app;
        $this->sentry = $sentry;
        $this->request = $request;
        $this->input = $request->request;
        $this->model = $model;
    }
    
    protected function success( $arrResult) {
        return new Response( json_encode( $arrResult, JSON_PRETTY_PRINT ), 200, array(
            'Content-Type' => 'application/json'
        )  );
    }
    
    protected function failure( $message ) {
        return new Response( json_encode( array( 'error' => $message ), JSON_PRETTY_PRINT ), 500, array(
            'Content-Type' => 'application/json'
        )  );
    }

    public function getOptions( $name ) {
        try {
            if ( $name == '' ) { $name = 'Default'; }
            $arrResult = $this->model->getOptions( $this->sentry->getUser()->id, $name );
            return $this->success( $arrResult );
        } catch (\Exception $e ) {
            return $this->failure( $e->getMessage() );
        }
    }

    public function saveOptions( $name ) {
        try {
            if ( $name == '' ) { $name = 'Default'; }
            $arrResult = $this->model->saveOptions( $this->sentry->getUser()->id, $name, $this->input->all() );
            return $this->success( $arrResult );
        } catch (\Exception $e ) {
            return $this->failure( $e->getMessage() );
        }
    }

}