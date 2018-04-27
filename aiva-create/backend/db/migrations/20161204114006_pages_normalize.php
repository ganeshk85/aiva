<?php

use Phinx\Migration\AbstractMigration;

class PagesNormalize extends AbstractMigration
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
        if ( !$pages->hasColumn('cta_name')) {
            $pages->addColumn('cta_name', 'string', array('default' => '', 'limit' => 255))->save();
        }
        if ( !$pages->hasColumn('transition_type')) {
            $pages->addColumn('transition_type', 'string', array('null' => true, 'default' => null, 'limit' => 255))->save();
        }
        if ( !$pages->hasColumn('transition_type')) {
            $pages->addColumn('transition_type', 'string', array('null' => true, 'default' => null, 'limit' => 255))->save();
        }
        if ( !$pages->hasColumn('target_users')) {
            $pages->addColumn('target_users', 'string', array('null' => false, 'default' => 'all', 'limit' => 255))->save();
        }
        if ( !$pages->hasColumn('vertical_position')) {
            $pages->addColumn('vertical_position', 'string', array('null' => false, 'default' => 'center', 'limit' => 255))->save();
        }
        if ( !$pages->hasColumn('horizontal_position')) {
            $pages->addColumn('horizontal_position', 'string', array('null' => false, 'default' => 'center', 'limit' => 255))->save();
        }
        if ( !$pages->hasColumn('trigger_value')) {
            $pages->addColumn('trigger_value', 'float', array('null' => false, 'default' => 10))->save();
        }
        if ( !$pages->hasColumn('scroll_lock')) {
            $pages->addColumn('scroll_lock', 'integer', array('null' => false, 'default' => 0))->save();
        }
        if ( !$pages->hasColumn('click_lock')) {
            $pages->addColumn('click_lock', 'integer', array('null' => false, 'default' => 0))->save();
        }
        if ( !$pages->hasColumn('cta_base_border')) {
            $pages->addColumn('cta_base_border', 'integer', array('null' => false, 'default' => 0))->save();
        }
        if ( !$pages->hasColumn('dim_background')) {
            $pages->addColumn('dim_background', 'integer', array('null' => false, 'default' => 0))->save();
        }
        if ( !$pages->hasColumn('page_selection_all')) {
            $pages->addColumn('page_selection_all', 'integer', array('null' => false, 'default' => 1))->save();
        }
        if ( !$pages->hasColumn('page_selection_extras')) {
            $pages->addColumn('page_selection_extras', 'text', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('include_fonts')) {
            $pages->addColumn('include_fonts', 'text', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('desktop_html')) {
            $pages->addColumn('desktop_html', 'text', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('mobile_html')) {
            $pages->addColumn('mobile_html', 'text', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('desktop_width')) {
            $pages->addColumn('desktop_width', 'float', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('desktop_height')) {
            $pages->addColumn('desktop_height', 'float', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('mobile_width')) {
            $pages->addColumn('mobile_width', 'float', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('mobile_height')) {
            $pages->addColumn('mobile_height', 'float', array('null' => true, 'default' => null))->save();
        }
        if ( !$pages->hasColumn('export_css')) {
            $pages->addColumn('export_css', 'text', array('null' => true, 'default' => null))->save();
        }
    }
}
