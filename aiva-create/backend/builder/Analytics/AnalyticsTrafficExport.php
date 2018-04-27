<?php namespace Builder\Analytics;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Builder\Analytics\AnalyticsModel;
use Builder\Projects\ProjectModel;
use Illuminate\Database\Query\Expression;

class AnalyticsTrafficExport extends AnalyticsExport {

    public function getData() {
        $model = new AnalyticsModel;
        $model->setEmail($this->objUser->email);

        $select = $model
            ->select(
                'log_date', 'ip_addr', 'elapsed_time', 'location',
                'name', 'device', 'prev_site', 'curr_site',
                'email',
                'text_collected', 'submit_value', 'cta', 'score', 'success'
            )
            ->orderBy('log_date', 'DESC');

        if ( $this->strIsoStart ) {
            $select->where( 'log_date', '>=', $this->strIsoStart.' 00:00:00' );
        }
        if ( $this->strIsoEnd ) {
            $select->where( 'log_date', '<=', $this->strIsoEnd.' 23:59:59' );
        }

        $arrCampaignNames = array();
        if ( $this->strClientName ) {
            $lstProjects = ProjectModel::where('client', $this->strClientName )->get();
            foreach ( $lstProjects as $objProj ) {
                $arrCampaignNames[] = $objProj->name;
                $arrCampaignNames[] = $objProj->name.' (Mobile)';
            }
        } else if ( $this->strCompanyName ) {
            $arrCampaignNames[] = $this->strCompanyName;
            $arrCampaignNames[] = $this->strCompanyName.' (Mobile)';
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
            $columns = array( 'log_date', 'ip_addr', 'elapsed_time', 'location',
                'campaign', 'device', 'prev_site', 'curr_site', 'email', 'text_collected',
                'submit_value', 'cta', 'score', 'success');
            $handle = fopen('php://output', 'w+');
            fputcsv($handle, $columns, ';');
            for ( $i = 0; $i < count( $data ); $i++ ) {
                $row = $data[ $i ];
                fputcsv($handle, array(
                    $row['log_date'],
                    $this->cleanIp( $row['ip_addr'] ),
                    $row['elapsed_time'],
                    $row['location'],
                    $row['name'],
                    $this->getDeviceName( $row['device'] ),
                    $row['prev_site'],
                    $row['curr_sire'],
                    $this->cleanEmail( $row['email'] ),
                    $row['text_collected'],
                    $row['submit_value'],
                    $row['cta'],
                    $row['score'],
                    $row['success']
                ), ';');
            }
            fclose($handle);
        });
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/plain; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="traffic-report.csv"');
        return $response;

        // $strCsv = json_encode( $this->getData() );
        // return new Response( json_encode( $this->getData() ), 200, array( 'Content-Type' => 'text/plain' ) );
    }


}
    