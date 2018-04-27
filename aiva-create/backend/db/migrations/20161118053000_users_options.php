<?php

use Phinx\Migration\AbstractMigration;

class UsersOptions extends AbstractMigration
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
        $clients = $this->table("users_options");
        $clients->addColumn("user_id", "integer")
		->addColumn("client", "string")
                ->addColumn("option_key", "string")
                ->addColumn("option_value", "text")
                ->addIndex(array("user_id"), array( 'unique' => false ))
  		->addIndex(array("client"), array( 'unique' => false ))
                ->addIndex(array("option_key"), array( 'unique' => false ))
                ->addIndex(array("user_id","client","option_key"), array( 'unique' => true ))
		->create();
    }
}
