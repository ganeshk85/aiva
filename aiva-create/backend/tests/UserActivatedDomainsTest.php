<?php

use Builder\Util\TestCase;
use Builder\Users\UserModel;
use Builder\Users\UserActivatedDomains;

// to debug the server, uncomment  and run:
// vendor\bin\phpunit tests/UserActivatedDomainsTest.php

class UserActivatedDomainsTest extends TestCase {
   
    public function setUp() {
        parent::setUp();
        
        $this->domains = new UserActivatedDomains( new UserModel );
        $this->domains->lstClients = array(
            (object)array( 'client_name' => 'The First One', 'client_url' => 'http://aivalabs1.com/', 'client_sortorder' => 0 ),
            (object)array( 'client_name' => 'The Second One', 'client_url' => 'http://aivalabs2.com/', 'client_sortorder' => 1 )
        );
    }
    
    public function testGetDefaultClient() {
         $this->assertEquals( $this->domains->getDefaultClient(), 'The First One');
         $this->domains->lstClients = array();
         $this->assertEquals( $this->domains->getDefaultClient(), '');
    }
    
    public function testGetDefaultClientUrl() {
         $this->assertEquals( $this->domains->getDefaultClientUrl(), 'http://aivalabs1.com/');
         $this->domains->lstClients = array();
         $this->assertEquals( $this->domains->getDefaultClientUrl(), '');
    }
    
    public function testGetClientUrlFromName() {
         $this->assertEquals( $this->domains->getClientUrlFromName('The Second One'), 'http://aivalabs2.com/');
         $this->assertEquals( $this->domains->getClientUrlFromName('Missing'), '');
         $this->domains->lstClients = array();
         $this->assertEquals( $this->domains->getClientUrlFromName('The Second One'), '');
    }

    public function testGetClientUrlExists() {
         $this->assertTrue( $this->domains->getClientUrlExists('aivalabs2.com/'));
         $this->assertTrue( $this->domains->getClientUrlExists('aivalabs1.com/'));
         $this->assertTrue( $this->domains->getClientUrlExists('http://aivalabs2.com/'));
         $this->assertTrue( $this->domains->getClientUrlExists('http://aivalabs1.com/'));
         $this->assertFalse( $this->domains->getClientUrlExists('Missing'));
         $this->domains->lstClients = array();
         $this->assertFalse( $this->domains->getClientUrlExists('http://aivalabs1.com/'));
    }
    
/*
    public function testEnsureExistsNoChange() {
        $this->domains->ensureExists('The First One', 'http://aivalabs1.com/', '');
        $this->assertEquals(2, count($this->domains->lstClients)); // nothing was expected to be added

        $this->domains->ensureExists('One', 'http://aivalabs2.com/', '');
        $this->assertEquals(2, count($this->domains->lstClients)); // nothing was expected to be added
    }
    
    public function testEnsureExistsAddsToTheBeginning() {
        $this->domains->ensureExists('The New One', 'http://new.com/', '');
        $this->assertEquals(3, count($this->domains->lstClients)); // nothing was expected to be added
        $this->assertEquals(0, $this->domains->lstClients[0]->client_sortorder);
        $this->assertEquals(1, $this->domains->lstClients[1]->client_sortorder);
        $this->assertEquals(2, $this->domains->lstClients[2]->client_sortorder);
    }*/
}