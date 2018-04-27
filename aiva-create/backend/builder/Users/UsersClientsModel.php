<?php namespace Builder\Users;

use Illuminate\Database\Eloquent\Model as Eloquent;

class UsersClientsModel extends Eloquent {

    protected $guarded = array('id');
    
    protected $fillable = array('user_id', 'client_name', 'client_url', 'client_timezone', 'client_sortorder');
    
    protected $table = 'users_clients';
    
    public  $timestamps = false;
}