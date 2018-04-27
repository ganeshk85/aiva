<?php namespace Builder\Projects;

use Illuminate\Database\Eloquent\Model as Eloquent;

class ProjectUsersModel extends Eloquent {

	protected $fillable = array('user_id', 'project_id');

	protected $table = 'users_projects';
}