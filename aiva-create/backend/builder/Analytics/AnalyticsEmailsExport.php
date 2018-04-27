<?php namespace Builder\Analytics;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Builder\Analytics\AnalyticsModel;
use Builder\Projects\ProjectModel;
use Illuminate\Database\Query\Expression;

class AnalyticsEmailsExport extends AnalyticsExport {


    /**
     * @return array
     * @throws \Exception
     */
    public function getData() {
        $model = new AnalyticsModel;
        $model->setEmail($this->objUser->email);
        $select = $model
            ->select( 'log_date', 'name', 'email', 'text_collected' )
            ->where( 'email', '<>', '' )
            ->orderBy('log_date', 'DESC');
        if ( $this->strIsoStart ) {
            $select->where( 'log_date', '>=', $this->strIsoStart.' 00:00:00' );
        }
        if ( $this->strIsoEnd ) {
            $select->where( 'log_date', '<=', $this->strIsoEnd.' 23:59:59' );
        }
        if ( $this->strCompanyName ) {
            $select->whereIn( 'name', array( $this->strCompanyName, $this->strCompanyName.' (Mobile)' ) );
        }
        return $select->get();
    }

    /**
     * Request instance.
     * 
     * @var Symfony\Component\HttpFoundation\Request
     */
    public function getCsv() {

        $data = $this->getData();
        $response = new StreamedResponse();
        $response->setCallback( function() use ($data) {
            $columns = array( 'log_date', 'campaign', 'email', 'text_collected');
            $handle = fopen('php://output', 'w+');
            fputcsv($handle, $columns, ';');
            for ( $i = 0; $i < count( $data ); $i++ ) {
                $row = $data[ $i ];
                fputcsv($handle, array(
                    $row['log_date'],
                    $row['name'],
                    $this->cleanEmail( $row['email'] ),
                    $row['text_collected']
                ), ';');
            }
            fclose($handle);
        });
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/plain; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="emails-report.csv"');
        return $response;
        // $strCsv = json_encode( $this->getData() );
        // return new Response( $strCsv, 200, array( 'Content-Type' => 'text/plain' ) );
    }
}