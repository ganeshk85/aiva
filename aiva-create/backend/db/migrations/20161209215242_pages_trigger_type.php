<?php

use Phinx\Migration\AbstractMigration;

class PagesTriggerType extends AbstractMigration
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
        $pages = $this->table('pages');

        if (!$pages->hasColumn('trigger_type')) {
            $pages->addColumn('trigger_type', 'string', array('null' => true, 'default' => null, 'limit' => 255))->save();
        }
    }
}
