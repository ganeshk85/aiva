<?php

use Phinx\Seed\AbstractSeed;
use Phinx\Db\Table;
use Builder\Analytics\AnalyticsModel;
use Builder\Util\DateBreakdown;
use Builder\Projects\PageObjective;

class AnalyticsSeeder extends AbstractSeed
{
    /** @var array */
    protected $OPTIONS = array();
    /** @var array */
    protected $arrCampaigns = array();
    /** @var Analytics */
    protected $model = null;
    /** @var int */
    protected $userId = 0;
    /** @var Faker\Generator */
    protected $faker = null;
    /** @var array of pages html */
    protected $pages = array();

    public function setup() { 
   	$this->OPTIONS = array(
            'email' => 'webcerebrium@gmail.com',
            
            'start'  => date('Y-m-d', time() - 3* 24 * 60 * 60 ), // ~ -2 weeks from now
            'finish' => date('Y-m-d'),

            'avg_totals_per_day' => 10,
            'avg_submits_per_day' => 4,
            'amplitude' => 0.5 // 0..1 - 0 means strict values
	);
        
        $this->model = new AnalyticsModel;
        $this->model->setEmail( $this->OPTIONS['email'] );
        
        $row = $this->fetchRow('SELECT * FROM users WHERE email = \''.$this->OPTIONS['email'].'\'' );
        if ( !is_array( $row )) {
            throw new \Exception('User was not found by email');
        }
        $this->userId = $row['id'];
        
        $this->faker = Faker\Factory::create();
    }
    
    protected function getCampaigns() {
        $campaigns = $this->fetchAll('SELECT id, name FROM projects ' . 
                ' WHERE id IN ( SELECT project_id FROM users_projects WHERE user_id = '.$this->userId.' )' );
        $arr = array();
        foreach ( $campaigns as $row ) { 
            $pagesOfProject = $this->fetchAll('SELECT html FROM pages WHERE pageable_id=' .$row['id'] );
            if (count($pagesOfProject)) {
                $this->pages[$row['name']] = $pagesOfProject[0]['html'];
            }
            $arr[] = $row['name']; 
            $arr[] = $row['name'].' (Mobile)'; 
        }
        return $arr;
    }
    
    protected function checkTableExists(Table $table) {
        
        try{ 
            // hasTable() doesn't work as we are requesting another database
            $this->fetchRow('SELECT id FROM '.$table->getName().' LIMIT 1');
            $exists = true;
        } catch (\PDOException $e) {
            $exists = false;
        }
       
        if ($exists) { $table->drop(); } 
        $table
            ->addColumn('log_date', 'timestamp')
                ->addIndex(array('log_date'), array('unique' => false))
            ->addColumn('date', 'string')
            ->addColumn('elapsed_time', 'integer')
            ->addColumn('ip_addr', 'string')
                ->addIndex(array('ip_addr'), array('unique' => false))
            ->addColumn('device', 'string')
            ->addColumn('location', 'string')
                ->addIndex(array('location'), array('unique' => false))
            ->addColumn('prev_site', 'string')
            ->addColumn('curr_site', 'string')
            ->addColumn('mouse_pos', 'text')
            ->addColumn('name', 'string')
                ->addIndex(array('name'), array('unique' => false))
            ->addColumn('email', 'string')
                ->addIndex(array('email'), array('unique' => false))
            ->addColumn('url', 'string')
                ->addIndex(array('url'), array('unique' => false))
            ->addColumn('text_collected', 'text')
            ->addColumn('submit_value', 'string')
            ->addColumn('cta', 'char', array('limit' => 1))
            ->addColumn('success', 'char', array('limit' => 1))
                ->addIndex(array('success'), array('unique' => false))
            ->addColumn('score', 'string')
	    ->addColumn('os', 'string')
                ->addIndex(array('os'), array('unique' => false))
	    ->addColumn('browser', 'string')
            ->create();

        return $this;
    }
    
    protected function getRandomInt( $val, $amplitude ) {
        return intval( mt_rand( 
                        $val * (1.0 - $amplitude), 
                        $val * (1.0 + $amplitude)
                    ) );
    }
    
    protected function generateData($table, $campaignName, $strIsoDate )
    {
        $fltAmplitude = $this->OPTIONS['amplitude'];
        $nTotals  = $this->getRandomInt( $this->OPTIONS['avg_totals_per_day'], $fltAmplitude );
        $nTotalSubmits = $this->getRandomInt( $this->OPTIONS['avg_submits_per_day'], $fltAmplitude );
        if ( $nTotalSubmits > $nTotals ) { $nTotalSubmits = $nTotals; }
        
        // distribute our 'plan of success'
        $arrSuccess = array();
        for ( $i = 0; $i < $nTotals; $i ++ ) { $arrSuccess[ $i ] = 0; }
        $k = 0; 
        while( $k < $nTotalSubmits ) {
            $index = mt_rand(0, $nTotals - 1);
            if ( $arrSuccess[ $index ] === 0 ) { $arrSuccess[ $index ] = 1; $k ++; }
        }
               
        $bHasSubmissions = false;
        $html = isset( $this->pages[$campaignName] ) ? $this->pages[$campaignName] : '';
        if ($html) {
            $bHasSubmissions = (new PageObjective($html))->hasSubmitElements();
        }
        
        $avgOffsetInMinutes = 12.0 * 60.0 / (float)$nTotals;
        echo date('c').' Expected totals: '. $nTotals.', submits: ~ '. $nTotalSubmits
                .'(avg interval '.$avgOffsetInMinutes .' minutes)'.PHP_EOL;
        
        $indexPerDay = 0; $nSubmits = 0;
        $data = array();
        while( $indexPerDay < $nTotals ) {
            
            $offsetInMinutes = $this->getRandomInt( $indexPerDay * $avgOffsetInMinutes, $fltAmplitude );
          
            $hour = 8 + intval( $offsetInMinutes / 60);
            $dt = $strIsoDate.' '.sprintf('%02d', $hour).':'
                    .sprintf('%02d', $offsetInMinutes % 60 ).':'
                    .sprintf('%02d', mt_rand(0, 60));
            
            $success = $arrSuccess[ $indexPerDay ];
            $ua = $this->faker->userAgent;
            $row = array(
                'log_date' => $dt,
                'date' => date('r', strtotime( $dt )),
                'elapsed_time' => mt_rand( 4000, 4000000 ),
                'ip_addr' => '::ffff:'.$this->faker->ipv4,
                'os' => $ua,
                'device' => $ua,
                'browser' => $ua,
                'name' => $campaignName,
                'cta' => 1,
                'success' => $success,
                'score' =>  $success ? mt_rand( 0, 10000 ) : 0
            );
            if ( $bHasSubmissions ) {
                $row['email'] = $success ? 'Email = '.$this->faker->email : '';
            } else {
                $row['url'] = $success ? 'URL = '.$this->faker->url : '';
            }
            if ( $success ) { $nSubmits++; }
            
            $data[] = $row;
            $indexPerDay ++;
        }
        
        echo date('c').' Seeding analytics for \''.$campaignName.'\' '.$strIsoDate.', generated '.count( $data ).' records, '.$nSubmits.' submits' . PHP_EOL;
        $table->insert($data);
    }

    /**
     * Run Method.
     *
     * Write your database seeder using this method.
     *
     * More information on writing seeders is available here:
     * http://docs.phinx.org/en/latest/seeding.html
     */
    public function run()
    {
        $this->setup();

        $table = $this->table($this->model->getTable());
        $this->checkTableExists($table);
        
	// for every user campaign
	$dates = new DateBreakdown();
        $arrDateRange = $dates->getPeriodBetween( $this->OPTIONS['start'], $this->OPTIONS['finish'] );
        foreach ( $this->getCampaigns() as $campaignName ) {
            foreach ( $arrDateRange as $dt ) {
                $this->generateData($table, $campaignName, $dt );
            }
        }
        $table->saveData();   
     }
}
