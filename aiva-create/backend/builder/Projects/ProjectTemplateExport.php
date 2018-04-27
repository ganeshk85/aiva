<?php namespace Builder\Projects;

use Builder\Util\Debug;

class ProjectTemplateExport extends ProjectHtmlExport {
    
    public function __construct( ProjectModel $project ) {
        global $app;
        parent::__construct($project);
        
        $this->ctaName = $this->page->cta_name;
        $this->overlayJson = $this->page->overlay_json;
        $this->templateName = str_replace(' ', '', ucwords($this->ctaName));
        
        $this->pathAivaTemplates = $app['base_dir'] . '/aivaTemplates';
        $this->outputHtmlPath = $this->pathAivaTemplates . '/'.$this->templateName.'/screenshot.tpl.html';
        
        $this->screenWidth = $this->pageWidth;
        $this->screenHeight = $this->pageHeight;
        $this->screenDim = $this->screenWidth.'x'.$this->screenHeight; 
        $this->screenOffsetY = 0;
    }
    
    protected function getBackground()
    {
        return '#fff';
        // return '#eeeeee';
    }
    
    protected function insertBlurredOverlay( $body ) {
        return $body;
    }
    
    /**
     * 
     * @return array
     * @throws \Exception
     */
    public function getTemplatesJson() {
        $filename = $this->pathAivaTemplates.'/templates.json';
        $file = fopen($filename, 'r');
        if( $file == false ) {
           throw new \Exception('Error in reading template json file');
        }
        $fsize = filesize($filename) + 1;
        $contents = fread($file, $fsize);
        fclose($file);
        return $this->jsonArray = json_decode($contents, true);
    }
    
    /**
     * getting last id in the given array
     * @return int
     */
    public function getLastId() {
        $jsonArrayCount = count($this->jsonArray);
        if ($jsonArrayCount == 0) {
            $lastId = 100;
        } else {
            $lastId = $this->jsonArray[$jsonArrayCount-1]['id'];
        }
        return $lastId;
    }
    
    public function fileWrite($filepath, $body, $errorTitle ) {
        $file = fopen($filepath, 'w');
        if( $file == false ) {
            throw new \Exception($errorTitle);
        }
        fwrite($file,$body);
        fclose($file);
        chmod($filepath, 0777);
        return $this;
    }
    
    public function getTemplateAsArray() {
        $pageHasSubmissions = (new PageObjective($this->page))->hasSubmitElements();
        if ($pageHasSubmissions) {
            $goal = "submission";
        } else {
            $goal = "click-through";
        }
        $creationDate = date("Y-m-d H:i:s");
        return array(
            "id" => $this->getLastId() + 1,
            "name" => $this->ctaName,
            "html" => "./aivaTemplates/".$this->templateName."/index.html",
            "css" => "./aivaTemplates/".$this->templateName."/style.css",
            "thumbnail" => "./aivaTemplates/".$this->templateName."/thumbnail.png",
            "overlayJson" => $this->overlayJson,
            "mobileOverlayJson" => $this->page->mobile_overlay_json,
            "goal" => $goal,
            "date_created" => $creationDate,
            "desktop_width" => $this->page->desktop_width,
            "desktop_height" => $this->page->desktop_height,
            "mobile_width" => $this->page->mobile_width,
            "mobile_height" => $this->page->mobile_height,
            "popularity" => 0,
            "filter_tags" => $this->page->filter_tags
        );
    }
    
    public function hasTemplate() {
        foreach ($this->jsonArray as $template) {
            if (strtolower($template['name']) === strtolower($this->ctaName)) return true;
        }
    }
    
    public function updateTemplate($newTemplate) {
        foreach ($this->jsonArray as &$template) {
            if (strtolower($template['name']) !== strtolower($this->ctaName)) continue;
            $template['overlayJson'] = $newTemplate["overlayJson"];
            $template['mobileOverlayJson'] = $newTemplate["mobileOverlayJson"];
            $template['goal'] = $newTemplate["goal"];
            $template['date_created'] = $newTemplate["date_created"];
            $template['desktop_width'] = $newTemplate["desktop_width"];
            $template['desktop_height'] = $newTemplate["desktop_height"];
            $template['mobile_width'] = $newTemplate["mobile_width"];
            $template['mobile_height'] = $newTemplate["mobile_height"];
            $template['filter_tags'] = $newTemplate["filter_tags"];
        }
    }
    
    public function updateTemplatesJson() {
        $this->getTemplatesJson();
        
        $newTemplate = $this->getTemplateAsArray();

        if ( ! $this->hasTemplate()) {
            array_push($this->jsonArray,  $newTemplate);
        } else {
            $this->updateTemplate($newTemplate);
        }
        //write new template json object to templates.json
        return $this->fileWrite($this->pathAivaTemplates.'/templates.json', 
                json_encode($this->jsonArray), 
                'Error in writing template json file' );
    }
    
    public function createTemplateFolder() {
        if ( ! file_exists($this->pathAivaTemplates."/".$this->templateName)) {
          if( ! mkdir($this->pathAivaTemplates."/".$this->templateName, 0777)) {
              throw new \Exception("Error in creating template folder");
          }
        }
        return $this;
    }
    
    protected function cleanHtml($html) {
        return str_replace( '<head></head>', '', $html);
    }
    
    public function createTemplateHtml() {
        return $this->fileWrite( 
                $this->pathAivaTemplates."/".$this->templateName."/index.html", 
                $this->cleanHtml($this->page->html), 
                'Error in writing template HTML file');
    }
    
    public function createTemplateCss() {
        return $this->fileWrite( 
                $this->pathAivaTemplates."/".$this->templateName."/style.css",
                $this->page->css,
                'Error in writing template CSS file');
    }
    
    
    /**
     * @return array
     */
    protected function getPngGenerationOptionsArray() {
        return array(
            'path' => str_replace( '\\', '/', dirname( $this->outputHtmlPath )),
            'url' => $this->outputHtmlPath,
            'output' => str_replace( '\\', '/', $this->pathAivaTemplates).'/'.$this->templateName.'/thumbnail.png',
            'size' => $this->page->desktop_width.'x'.$this->page->desktop_height,
            'resize' => $this->thumbRectWidth*2,
            'crop' => ($this->thumbRectWidth*2).'x'.(($this->thumbRectWidth*2 * $this->page->desktop_height)/$this->page->desktop_width),
            'cleanPath' => str_replace( '\\', '/', $this->pathAivaTemplates).'/'.$this->templateName
        );
    }  
    
    
    public function createTemplateThumbnail() {
        return $this->generateHtml()->generatePng();
    }
    
    /**
     * Main entry point of export
     */
    public function export() {
       
        $this->createTemplateFolder();
        $this->createTemplateHtml();
        $this->createTemplateCss();
        $this->createTemplateThumbnail();
        $this->updateTemplatesJson();
        return $this;
    }

}
