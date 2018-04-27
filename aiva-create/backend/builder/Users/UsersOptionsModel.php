<?php  namespace Builder\Users;

use Illuminate\Database\Eloquent\Model as Eloquent;

class UsersOptionsModel extends Eloquent {

    protected $guarded = array('id');
    
    protected $fillable = array('user_id', 'client', 'option_key', 'option_value');
    
    protected $table = 'users_options';
    
    public  $timestamps = false;
    
    /**
     * Getting single options value
     * 
     * @param int    $userId
     * @param string $clientName
     * @param string $key
     * @param string $defaults
     * @return type
     */
    public static function getOption( $userId, $clientName, $key, $defaults = '' ) {
        $model = new UsersOptionsModel();
        $arrOptions = $model->getOptions($userId, $clientName);
        return ( isset( $arrOptions[ $key ] ) ) ? $arrOptions[ $key ] : $defaults;
    }
    
    /**
     * Setting single user options value
     * 
     * @param int $userId
     * @param string $clientName
     * @param string $key
     * @param string $value
     */
    public static function setOption( $userId, $clientName, $key, $value ) {
         $model = new UsersOptionsModel();
         $model->saveOptions( $userId, $clientName, array( $key => $value ));
    }
    
    /**
     * Getting all options for certain users client
     * Please use 'Default' if quering all default user options
     * Returns assotiative array of options
     * 
     * @param int $userId
     * @param string $clientName
     * @return array
     */
    public function getOptions( $userId, $clientName ) {
        $arr = array();
        $list = UsersOptionsModel::whereuser_id( $userId )->whereclient( $clientName )->get();
        if ( strtolower( $clientName ) !== 'default' ) {
           $listDefault = UsersOptionsModel::whereuser_id( $userId )->whereclient( 'Default' )->get();
           foreach ( $listDefault as $val ) {
                $arr[ $val['option_key'] ]  = $this->valueFromString( $val['option_value'] );
           }
        }
        foreach ( $list as $val ) {
            $arr[ $val['option_key'] ]  = $this->valueFromString( $val['option_value'] );
        }
        return $arr;
    }

    /**
     * 
     * @param int $userId
     * @param string $clientName
     * @param array  $arrValues
     * @return array of ids that were modified
     */   
    public function saveOptions( $userId, $clientName, $arrValues ) {
        $arrIds = array();
        foreach ( $arrValues as $key => $val ) {
            $list = UsersOptionsModel::whereuser_id( $userId )
                        ->whereclient( $clientName )
                        ->whereoption_key( $key )
                        ->get();
            if ( count($list)> 0 ) {
                // updating existing values
                $list[0]->option_value = $this->valueToString( $val );
                $list[0]->save();
                $arrIds[] = $list[0]->id;
            } else {
                $obj = new UsersOptionsModel();
                $obj->user_id = $userId;
                $obj->client = $clientName;
                $obj->option_key = $key;
                $obj->option_value = $this->valueToString( $val );
                $obj->save();
                $arrIds[] = $obj->id;
            }
        }
        return $arrIds;
    }
    
    protected function valueToString($val) {
        // wrapper for potential growth
        return $val;
    }
    
    protected function valueFromString($val) {
        // wrapper for potential growth
        return $val;
    }

}   