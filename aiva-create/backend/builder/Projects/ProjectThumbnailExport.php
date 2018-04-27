<?php namespace Builder\Projects;

use Builder\Util\Debug;

class ProjectThumbnailExport extends ProjectHtmlExport {
    
    protected $margin = 0;
    
    public function __construct( ProjectModel $project ) {
        parent::__construct($project);
        
        $this->baseHtmlPath = $this->path;
        $this->outputHtmlPath = str_replace( '\\', '/', $this->path . '/project-' . $this->project->id. '.thumb.html');
        $this->outputPngPath = str_replace( '\\', '/', $this->path . '/project-' . $this->project->id. '-thumb.png');
        
        $this->screenDim = $this->screenWidth.'x'.$this->screenHeight; 
        $this->screenOffsetY = 0;
    }
    
    protected function getBackground() {
        return '#fff';
        // return '#eeeeee';
    }
    
    protected function cleanHtml($html) {
        return str_replace( '<head></head>', '', $html);
    }
    
    /**
     * @return array
     */
    protected function getPngGenerationOptionsArray() {
        return array(
            'path' => $this->baseHtmlPath,
            'url' => $this->outputHtmlPath,
            'output' => $this->outputPngPath,
            'size' => $this->pageWidth.'x'.$this->pageHeight,
            'centered' => $this->pageWidth.'x'.$this->pageHeight
        );
    }
    
    public function createThumbnail() {
        return $this->generateHtml()->generatePng();
    }
    
}