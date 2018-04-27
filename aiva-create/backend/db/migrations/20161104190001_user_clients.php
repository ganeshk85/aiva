<?php

use Phinx\Migration\AbstractMigration;

class UserClients extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     *
     * The following commands can be used in this method and Phinx will
     * automatically reverse them when rolling back:
     *
     *    createTable
     *    renameTable
     *    addColumn
     *    renameColumn
     *    addIndex
     *    addForeignKey
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change()
    {
	$clients = $this->table("users_clients");
        $clients->addColumn("user_id", "integer")
		->addColumn("client_name", "string")
		->addColumn("client_url", "string")
		->addColumn("client_timezone", "string")
		->addColumn("client_sortorder", "integer", array( 'default' => 0 ))
                ->addColumn('created', 'datetime')
                ->addColumn('updated', 'datetime', array('null' => true))
  		->addIndex(array("user_id"), array())
		->create();
    }
}
