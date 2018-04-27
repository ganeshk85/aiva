<?php namespace Builder\Analytics;

use Illuminate\Database\Eloquent\Model as Eloquent;

class AnalyticsModel extends Eloquent {

    protected $guarded = array('id');
    
    protected $fillable = array( 
        'log_date', 'date', 'elapsed_time', 
        'ip_addr', 'device', 'location', 'prev_site', 'curr_site', 
        'mouse_pos', 'name', 'email', 'text_collected', 'submit_value',
        'cta', 'success', 'score'
    );
    
    protected $table = '';
    
    public  $timestamps = false;
    
    public function setEmail($email) {
        if ( !is_string($email)) {
            throw new \Exception('Email was expected to identify analytics table');
        }
        $dbname = getenv('DB_ANALYTICS') ? getenv('DB_ANALYTICS') : 'analytics';
        $this->table = $dbname.'.'.str_replace( '@', 'AT', str_replace( '.', 'DOT', $email ) );
        return $this;
    }
            
    public function hasData(){ 
        global $app;
        if ( !$this->table ) {
            throw new \Exception('Please call setEmail() method first to define data table');
        }
        list( $dbname, $table ) = explode( '.', $this->table );
        $db = $app['illuminate.db'];
       
        $sql = "SELECT * FROM information_schema.tables WHERE table_name = ? AND table_schema = ?";
        $statement = $db->getPdo()->prepare($sql);
        $result = $statement->execute(array( $table, $dbname ));
        if ( !$result) { return false; }
        $results = $statement->fetchAll(\PDO::FETCH_ASSOC);
        return count( $results ) > 0;
    }
}