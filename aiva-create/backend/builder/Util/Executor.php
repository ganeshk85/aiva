<?php
namespace Builder\Util;

class Executor
{
    public $nLastReturn = -1;
    public $strLastCommand = '';
    public $strLastOutput = '';
    public $strLastWriteStream = '';
    public $strLastErrorStream = '';
    public $resourceLastProcess = null;
    
    protected function flush() {
        $st = ob_get_status();
        if (! empty($st)) { 
            ob_flush(); 
        } else {
            flush();
        }
    }
    
    /**
     * 
     * @param string $strCommand
     * @param string $input
     * @param boolean $bShowOutput
     * @return \Builder\Util\Executor
     */
    public function justRun( $strCommand, $input = '', $bShowOutput = false ) {
        
        $descriptorspec = array(
            0 => array('pipe', 'r'),
            1 => array('pipe', 'w'),
            2 => array('pipe', 'w')
        );
        $pipes = array();
        $this->strLastCommand = $strCommand;
        $this->nLastReturn = -1;
        $this->strLastOutput = '';
        $this->resourceLastProcess = proc_open($strCommand, $descriptorspec, $pipes);
        $this->strLastWriteStream = '';
        $this->strLastErrorStream = '';
        if ( is_resource( $this->resourceLastProcess ) ) {
            fwrite($pipes[0], $input);
            fclose($pipes[0]);
            for( $i = 1; $i <= 2; $i ++ ) {
                $s = '';
                do {
                    $s = fgets($pipes[$i], 128);
                    $this->strLastOutput .= $s;

                    if ( $i == 1 ) {
                        $this->strLastWriteStream .= $s;
                    } else if ( $i == 2 ) {
                        $this->strLastErrorStream .= $s;
                    }
                    if ($bShowOutput) { echo $s; $this->flush(); }

                } while ( $s );
                fclose($pipes[ $i ]);
            }
            $this->nLastReturn = proc_close( $this->resourceLastProcess );
        }
        return $this;
    }
    
    public function run( $strCommand, $input = '' ) {
        $this->justRun( $strCommand, $input, false );
        if ( $this->nLastReturn ) {
            throw new \Exception( 'Error code: '.$this->nLastReturn.'; '.$this->strLastErrorStream );
        }
        return $this;
    }
    
    public function runInBackground($strCommand, $input = '') {
        if ( strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ) {
            $strCommandInBackground = 'start '.$strCommand;
        } else {
            $strCommandInBackground = '/usr/bin/nohup '.$strCommand.' &';
        }
        return $this->run($strCommandInBackground, $input);
    }
    
    /**
     * @param array $arr
     * @return string
     */
    public function commandLineFromArray(array $arr) {
        $arrItems = array();
        foreach ( $arr as $key => $val ) {
            $value = $val;
            if ( $val === true ) {$value = ' '; }
            else if ( $val === false ) { continue; }
            $arrItems[] = '--'.$key.' '.$value;
        }
        return implode(' ', $arrItems);
    }
}