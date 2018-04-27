<?php namespace Builder\Users;

use Builder\Util\CanonicalUrl;

class UserActivatedDomains {
    
    public $lstClients = array();
    
    public function __construct(UserModel $u) {
        if (!is_object($u)) {
            throw new \Exception('User was not provided to word with activated domains');
        }
        $this->u = $u;
        // User clients table is the primary source of the information
        $this->refreshClientsList();
    }
    
    /**
     * Update sort in the database
     * @param type $baseNumber
     */
    public function arrangeSortOrder( $baseNumber = 0 ) {
        $n = $baseNumber;
        foreach ( $this->lstClients as $obj ) {
            if ($obj->client_sort_order != $n) {
                $obj->client_sortorder = $n;
                $obj->save();
            }
            $n ++;
        }
    }
    
    public function refreshClientsList() {
        if ( is_object($this->u) && $this->u->id ) {
            $this->lstClients = UsersClientsModel::whereuser_id($this->u->id)->orderBy('client_sortorder')->get();
        }
        return $this;
    }
    
    
    private function filterUrl($url) {
        // how to filter each domain
        return trim($url);
    }
    
    /**
     * Client name - used on project creation
     * @return string
     */
    public function getDefaultClient() {
        foreach ( $this->lstClients as $client ) {
            return $client;
        }
        return '';
    }
    
    /**
     * Client url - from the first website in the list
     * Empty string in case of empty clients list
     * @return string
     */
    public function getDefaultClientUrl() {
        foreach ( $this->lstClients as $client ) {
            return $client->client_url;
        }
        return '';
    }
    
    /**
     * Client url - from the given client name.
     * Empty string in case it was not found.
     * 
     * @return string
     */
    public function getClientUrlFromName($strName) {
        $name = strtolower(trim($strName));
        foreach ( $this->lstClients as $client ) {
            if (strtolower(trim($client->client_name)) === $name) {
                return $client->client_url;
            }
        }
        return '';
    }
    
    /**
     * Client payment plan - from the given client name.
     * Empty string in case it was not found.
     * 
     * @return boolean
     */
    public function getClientPaymentPlan($strName) {
        $name = strtolower(trim($strName));
        foreach ( $this->lstClients as $client ) {
            if (strtolower(trim($client->client_name)) === $name) {
                return $client->payment_plan;
            }
        }
        return 'none ';
    }
    
     /**
     * Client url - from the given client name.
     * Empty string in case it was not found.
     * 
     * @return boolean
     */
    public function getClientUrlExists($strUrl) {
        $url = new CanonicalUrl(trim($strUrl));
        foreach ( $this->lstClients as $client ) {
            if ($client->client_url === $url->get()) {
                return true;
            }
        }
        return false;
    }
   
    /**
     * Get options of clients names - for selection on projects creation
     * @return array
     */
    public function getClientNameArray() {
        $arrNames = array();
        foreach ( $this->lstClients as $client ) {
            if (trim($client->client_name)) {
                $arrNames[] = trim($client->client_name);
            }
        }
        return $arrNames;
    }
    
    /**
     * @return array of string
     */
    public function getAsArray() {
        $arrDomains = array();
        
        // adding URL from the profile
        $sDomain = $this->filterUrl($this->u->user_url);
        if ($sDomain) { $arrDomains[] = $sDomain; }
        
        // adding URLs from the clients Table
        foreach ( $this->lstClients as $client ) {
            $sDomain = $this->filterUrl($client->client_url);
            if ($sDomain && array_search($sDomain, $arrDomains) === false) {
                $arrDomains[] = $sDomain;
            }
        }
        return $arrDomains;
    }
        
    /**
     * @return string
     */
    public function get() {
        return implode( ',', $this->getAsArray() );
    }

    /**
     * @return int
     */
    public function count() {
        return count( $this->getAsArray() );
    }
    
    /**
     * 
     * @param UserModel $u
     * @return \Builder\Users\UsersClientsModel
     */
    protected function clientFromProfile($u) {
        if (!is_object($u) || !$u->user_url) { return null; }
        
        $client = new UsersClientsModel();
        $client->user_id = $u->id;
        $client->client_name = $u->first_name .' '.$u->last_name;
        $client->client_url = (new CanonicalUrl($u->user_url))->get();
        $client->client_timezone = $u->timezone;
        $client->client_sortorder = 0;
        $client->created = date('Y-m-d H:i:s');
        $client->updated = date('Y-m-d H:i:s');
        $client->save();
        return $client;
    }
 
    private function ensureExists() {
        if ($this->u->user_url && !$this->getClientUrlExists($this->u->user_url)) {
            $this->arrangeSortOrder(1);
            $this->clientFromProfile($this->u);
            $this->refreshClientsList();
        }
        return $this;
    }
   
    public function save() {
        
        if ( count( $this->lstClients ) == 0 && $this->u->user_url) {
            // if there are no clients yet in the list, we will save
            // the first one, creating it from the user's profile.
            $this->clientFromProfile($this->u);
            $this->refreshClientsList();
        } else {
            $this->ensureExists();
        }
        $this->u->activated_domains = $this->get();
        $this->u->save();
        
        $this->patchCampaigns();
        return $this;
    }
    
    public function patchCampaigns() {
        if (!is_object($this->u)) { return null; }

        $defaultNameToPut = $this->getDefaultClient();
        // traverse all user campaigns, check $project->client on each
        $lstCampaigns = $this->u->projects()->get();
        foreach ( $lstCampaigns as $objCampaign ) {
            if ( !$objCampaign->client || !$this->getClientUrlFromName($objCampaign->client)) {
                $objCampaign->client = $defaultNameToPut;
                $objCampaign->save();
            }
        }
        return $this;
    }
}