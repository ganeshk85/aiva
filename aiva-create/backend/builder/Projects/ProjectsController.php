<?php namespace Builder\Projects;

use Silex\Application;
use Builder\Projects\ProjectModel as Project;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Builder\Projects\Services\ProjectCreator;
use Builder\Projects\Services\ProjectRepository;
use Builder\Util\Debug;
use Builder\Users\UserActivatedDomains;

class ProjectsController {

	/**
	 * Silex application instance.
	 *  
	 * @var Silex\Application
	 */
	private $app;

	/**
	 * Exporter instance.
	 * 
	 * @var Builder\Exports\Exporter
	 */
	private $exporter;

	/**
	 * Request instance.
	 * 
	 * @var Symfony\Component\HttpFoundation\Request
	 */
	private $request;

	/**
	 * Paramater bag instance.
	 * 
	 * @var Symfony\Component\HttpFoundation\ParameterBag
	 */
	private $input;

	/**
	 * ProjectCreator instance.
	 * 
	 * @var Builder\Projects\Services\ProjectCreator
	 */
	private $creator;

	/**
	 * ProjectRepository instance.
	 * 
	 * @var Builder\Projects\Services\ProjectRepository
	 */
	private $repository;

	/**
	 * Create new ProjectsController instance.
	 * 
	 * @param Application $app    
	 * @param Request     $request
	 */
	public function __construct(Request $request, ProjectCreator $creator, ProjectRepository $repo, $exporter, $app)
	{	
		$this->app = $app;
                $this->log = $app['monolog'];
                $this->sentry = $app['sentry'];
		$this->repo = $repo;
		$this->creator = $creator;
		$this->request = $request;
		$this->exporter = $exporter;
		$this->input = $request->request;	
	}
    
	/**
	 * Render and display project assets as a site.
	 * 
	 * @param  int|string $id
	 * @return Response
	 */
	public function render($id, $name)
	{
        $project = $this->repo->find((int)$id);

		if ( ! $project || ! $project->published) {
			return $this->app['twig']->render('404.twig.html');
		}

		$path = $this->exporter->project((int) $id, false);

		if ( ! $path) {
            return $this->app['twig']->render('404.twig.html');
		}
		
		$base = str_replace($this->app['base_dir'], $this->app['base_url'], $path);

		return $this->app->redirect($base.$name.'.html');
	}

	/**
	 * Create a new project.
	 * 
	 * @return Response
	 */
	public function store()
	{
		if ( ! $this->app['sentry']->getUser()->hasAccess('projects.create')) {
			return new Response($this->app['translator']->trans('noPermProjectCreate'), 403);
		}

		if ( ! $this->input->has('name')) {
			return new Response($this->app['translator']->trans('projectNameRequired'), 400);
		}
                
                if (preg_match('/[\'\"^£$%&*()}{@#~?><>,|=_+¬-]/', $this->input->get('name'))) {
			return new Response($this->app['translator']->trans('projectBadName'), 400);
		}

		if ($this->repo->find($this->input->get('name'))) {
			return new Response($this->app['translator']->trans('projectWithNameExists'), 400);
		}
                
                //Check if user has at least one website added
                if (! $this->input->has('client')) {
                    $defaultClient = (new UserActivatedDomains($this->sentry->getUser()))->getDefaultClient();
                    if ($defaultClient === '') {
                        return new Response($this->app['translator']->trans('noWebsiteAdded'), 400);
                    }
                }

		return new Response($this->creator->create($this->input->all()), 201);
	}

	/**
	 * Update an existing project.
	 * 
	 * @param  sting/int $id
	 * @return Response
	 */
	public function update($id)
	{
		if ( ! $this->app['sentry']->getUser()->hasAccess('projects.update')) {
			return new Response($this->app['translator']->trans('noPermProjectUpdate'), 403);
		}

		$p = $this->creator->update($this->input->all());

		if ( ! $p) {
			return new Response($this->app['translator']->trans('problemUpdatingProject'), 500);
		}

		return new Response(json_encode($p), 200);
	}
        
        /**
	 * Update an client url for project.
	 * 
	 * @param  sting/int $id
	 * @return Response
	 */
//	public function updateClient($id)
//	{
//		if ( ! $this->app['sentry']->getUser()->hasAccess('projects.update')) {
//			return new Response($this->app['translator']->trans('noPermProjectUpdate'), 403);
//		}
//
//		$p = $this->creator->update($this->input->all());
//
//		if ( ! $p) {
//			return new Response($this->app['translator']->trans('problemUpdatingProject'), 500);
//		}
//
//		return new Response(json_encode($p), 200);
//	}

	/**
	 * Publish project with given id.
	 * 
	 * @param  string|int $id
	 * @return Response
	 */
	public function publish($id)
	{
		if ($project = $this->repo->find((int)$id)) {
			$project->published = 1;
			$project->save();
            if ($user = $this->app['sentry']->getUser()) {
                $activatedCampaigns = explode(",", $user->activated_ctas);
                if (!in_array($project->id,$activatedCampaigns)) {
                    array_push($activatedCampaigns, $project->id);
                    $user->update(array('activated_ctas' => implode(",", array_diff($activatedCampaigns, array('')))));
                }
            } else {
                return new Response("User not found", 404);
            }
		} else {
            return new Response("Project not found", 404);
        }
        
		return new Response($this->app['translator']->trans('projectPublishSuccess'), 200);
	}

	/**
	 * Unpublish project with given id.
	 * 
	 * @param  string|int $id
	 * @return Response
	 */
	public function unpublish($id)
	{
		if ($project = $this->repo->find((int)$id)) {
			$project->published = 0;
			$project->save();
            if ($user = $this->app['sentry']->getUser()) {
                $activatedCampaigns = explode(",", $user->activated_ctas);
                if (in_array($project->id,$activatedCampaigns)) {
                    unset($activatedCampaigns[array_search($project->id,$activatedCampaigns)]);
                    $user->update(array('activated_ctas' => implode(",", array_diff($activatedCampaigns, array('')))));
                }
            } else {
                return new Response("User not found", 404);
            }
		} else {
            return new Response("Project not found", 404);
        }

		return new Response($this->app['translator']->trans('projectUnpublishSuccess'), 200);
	}

	public function saveImage($id)
	{	
            $this->path = $this->app['base_dir'] . '/assets/images/projects';
            $project = $this->repo->find((int)$id);
            if ( is_object( $project ) ) {
                try{
                    try {
                        (new ProjectHtmlExport($project))->generateHtml()->generatePng();
                    } catch (ProjectHtmlExportException $e) {
                        // Debug::msg([$e->getMessage(), $e->getTraceAsString()]);
                        copy( $this->path . "/not-found.png",
                              $this->path . "/project-" . $project->id . ".png"  );
                    }
                    
                    try {
                        (new ProjectThumbnailExport($project))->generateHtml()->generatePng();
                    } catch (ProjectHtmlExportException $e) {
                        // Debug::msg([$e->getMessage(), $e->getTraceAsString()]);
                        copy( $this->path . "/not-found.png",
                              $this->path . "/project-" . $project->id . ".thumb.png"  );
                    }
                    
                    return new Response($this->app['base_url'].'/assets/images/projects/project-'.$id.'.png', 200);
                } catch ( \Exception $e ) {
                    return new Response( 'ERROR: '.$e->getMessage(), 500);
                }
            } else {
                return new Response( 'ERROR: Project Not Found', 404);
            }
	}

	public function index()
	{
            return new Response($this->repo->all());
	}
        
    public function thumbnals()
    {
        set_time_limit( 600 );
        $nProjects = 0; $nFailed = 0;
        $this->path = $this->app['base_dir'] . '/assets/images/projects';
        $out = array();

        // foreach ( Project::all() as $project ) {
        foreach ( $this->repo->all() as $project) { // generating only what is assigned to user
            try {
                (new ProjectHtmlExport($project))->generateHtml()->generatePng();
                $nProjects++;
                $out[] = 'campaign #'. $project->id.': ok';
            } catch (ProjectHtmlExportException $e) {
                $nFailed ++;
                $out[] = 'campaign #'. $project->id.': ERROR: '.$e->getMessage();

                copy( $this->path . "/not-found.png",
                      $this->path . "/project-" . $project->id . ".png"  );
            }
            
            try {
                (new ProjectThumbnailExport($project))->generateHtml()->generatePng();
                $nProjects++;
                $out[] = 'campaign #'. $project->id.' thumb: ok';
            } catch (ProjectHtmlExportException $e) {
                $nFailed ++;
                $out[] = 'campaign #'. $project->id.' thumb: ERROR: '.$e->getMessage();
                copy( $this->path . "/not-found.png",
                      $this->path . "/project-" . $project->id . ".thumb.png"  );
            }
            
        }
        return new Response( 'Done: '. $nProjects.', failed: '.$nFailed 
                ."<hr />".implode( "<br />", $out), 200 );
    }

    /**
	 * Create a template from a project
	 * 
	 * @param  int/string $id
	 * @return Response
	 */
    public function createTemplate($id) 
    {
       
        if ( ! $this->app['sentry']->getUser()->hasAccess('templates.create')) {
            return new Response($this->app['translator']->trans('noPermTemplateCreate'), 403);
        }
        
        $this->project = $this->repo->find((int)$id);
        try {
            $json = (new ProjectTemplateExport($this->project))->export()->getTemplateAsArray();
            return new Response(json_encode($json), 200);
        } catch (\Exception $ex) {
            return new Response($ex->getMessage(), 403);
        }
    }
    
    /**
	 * Create a duplicate of a project
	 * Needs clean up
	 * 
	 * @param  int/string $id
	 * @return new page created
	 */
    public function duplicate($id) 
    {
        $logString = '';
        
        //Get all appropriate pages and projects
        $this->newProject = $this->creator->create($this->input->all());
        $this->newPage = $this->newProject->pages->get(0);
        $this->project = $this->repo->find((int)$id);
        $this->page = $this->project->pages->get(0);
        
        $pageObject = json_decode($this->page);
        $keysToAvoid = array("id","html","css","pageable_id","created_at","desktop_html","mobile_html","export_css","libraries","created_at","updated_at");
        //Copy properties over that don't need special conversions
        foreach($pageObject as $key => $value){
            if (!in_array($key, $keysToAvoid)) {
                $logString .= $key." ";
                $this->newPage->$key = $value;
            }
        }
        
        //Handle custom properties
        $this->newPage->cta_name = $this->newProject->name;
        
        //Create array of strings to replace
        $elementNamesArray = array();
        $elementList = array('image-','shape-','textBox-','button-','emoji-','passwordInput-','emailInput-','textInput-');
        $t = microtime(true);
        $micro = sprintf("%06d",($t - floor($t)) * 1000000);
        $d = new \DateTime( date('Y-m-d H:i:s.'.$micro, $t) );
        $dateToAppend = $d->format("YmdHisu");
        
        foreach ($elementList as $element) {
    //                    echo "\n Seaching for " . $element . "\n";
            $elemStartPos = 0;
            $searchString = $this->page->html;
            while (strpos($searchString, $element)) {
    //                        echo "search started\n";
                $elemStartPos = strpos($searchString, $element);
    //                        echo "\nFound " . $element . " @ " . $elemStartPos;
                $searchString = substr($searchString, $elemStartPos);
    //                        echo $searchString;

                if (is_int($elemStartPos)) {

                    $hypenPos = strpos($searchString, '-');
                    //+ 13 needs to be removed
                    $elemEndPos = $hypenPos + 1;
                    while(is_numeric($searchString[intval($elemEndPos)])) {
                        $elemEndPos++;
                    }
                    $elementName = substr($searchString, 0, $elemEndPos);
                    if (!array_key_exists($elementName, $elementNamesArray)) {
    //                                echo $elementName . "\n";
    //                                echo $elementName . "-copyOf" . $fromPageId . "-" . $dateToAppend;
                        $elementNamesArray[$elementName] = $elementName . "-copyOf" . $this->page->id . "-" . $dateToAppend;
                    }
                } 
            }
        }
        //run replace function
        $propertiesToReplace = array("html","css","desktop_html","mobile_html","export_css");
        foreach ($propertiesToReplace as $property) {
            foreach ($elementNamesArray as $oldElement => $newElement) {
    //                echo "Element found = " . $element;
                $this->newPage->$property = str_replace($oldElement, $newElement, $this->page->$property);
            }
        }
        
        //copy thumbnail over
        $this->path = $this->app['base_dir']."/assets/images/projects/";
        $projectThumbnail = $this->path."project-".$id.".png";
        if (file_exists($projectThumbnail)) {
            $newProjectThumbnail = $this->path."project-".$this->newProject->id.".png";
            if (!copy($projectThumbnail, $newProjectThumbnail)) {
                $logString .= "thumbnail not copied";
            }
        }
        
        $this->newPage->save();
        
        return new Response($this->newPage, 200);
    }
    
    /**
	 * Complie html, css, js and export to
	 * user webexport folder
     *  
	 * @param  int/string $id
	 * @return log string
	 */
    public function export()
	{
        $logString = '';
        $user = $this->app['sentry']->getUser();
        $persistCode = str_replace('$2y$08$','',$user->persist_code);
        $readyToExport = true;
        $clientEmail = $user->email;
        
        $this->path = $this->app['base_dir']."/webExports/";
        $filename = $this->path.'triggerController.min.js';
        $file = fopen( $filename, "r" );
        if( $file == false ) {
           $logString .= "Error in opening triggerController file";
        }
        $filesize = filesize( $filename );
        $triggerText = fread($file, $filesize);
        fclose( $file );

        //Create folder for user
        $clientFolderPath = $this->path.$clientEmail;
        if (!file_exists($clientFolderPath)) {
            if(!mkdir($clientFolderPath, 0777, true)) {
                $logString .= "Failed to make folder ".$clientFolderPath." ";
            }
        }

        //create projectArray with all activated campaigns
        $projectArray = array();
        $activatedCtas = explode(",",$user->activated_ctas);
        foreach($activatedCtas as $ctaId) {
            if (is_numeric($ctaId)) {
                $projectToExport = $this->repo->find((int)$ctaId);
                //Legacy support for domains enabled
                //check if project has client_url if not add it
                $domains = new UserActivatedDomains($this->app['sentry']->getUser());
                if (strlen($projectToExport->client_url) == 0) {
                    $projectToExport->client_url = $domains->getClientUrlFromName($projectToExport->client);
                }
//                $pageToExport = $projectToExport->pages->get(0);
//                $pageObject = (array) json_decode($projectToExport);
                $projectToExport->payment_plan = $domains->getClientPaymentPlan($projectToExport->client);
                array_push($projectArray, $projectToExport);
//                $logString .= $pageObject['overlay_json']." ";
            } else {
                $readyToExport = false;
            }
        }
        
        //get all info from differnt projects and build arrays accordingly
        $cssText = '';
        $includeFonts = '';
        $htmlArray = $ctaName = $transitionType = $triggerType = $triggerValue = $scrollLock = $domainsEnabled =
            $clickLock = $targetAllUsers = $verticalPosition = $horizontalPosition = $pageSelection = $injectJs
            = $pageWhiteList = $pageBlackList = $dimBackground = $videoJson = $ctaWidth = $ctaHeight = $hideThisCta
            = $schedulingRange = $schedulingTime = $schedulingHours = $schedulingStart = $schedulingFinish  =
            $paymentPlan = array();

        $ctaIndex = 0;
        if ($readyToExport) {
            foreach($projectArray as $projectObject) {
                $projectObjectArray = (array) json_decode($projectObject);
                $pageObject = $projectObject->pages->get(0);
                $pageArray = (array) json_decode($pageObject);
                $cssText .= str_replace(array(".cta-lg div.cta {",".cta-sm div.cta {"), "div.cta {", $pageArray["export_css"]);
                $includeFonts = $pageArray["include_fonts"];
                $mobileAlternator = 0;
                while($mobileAlternator < 2) {
                    //push desktop info
                    if ($mobileAlternator == 0) {
                        array_push($htmlArray, $pageArray["desktop_html"]);
                        array_push($ctaWidth, $pageArray["desktop_width"]);
                        array_push($ctaHeight, $pageArray["desktop_height"]);
                        array_push($ctaName, $pageArray["cta_name"]);
                        array_push($videoJson, $pageArray["desktop_video_json"]);
                        $overlayJson = (array) json_decode($pageArray['overlay_json']);
                        array_push($hideThisCta, $overlayJson["overlay"]->hide->desktop);
                    }
                    //push mobile info
                    else {
                        array_push($htmlArray, $pageArray["mobile_html"]);
                        array_push($ctaWidth, $pageArray["mobile_width"]);
                        array_push($ctaHeight, $pageArray["mobile_height"]);
                        array_push($ctaName, $pageArray["cta_name"]." (Mobile)");
                        array_push($videoJson, $pageArray["mobile_video_json"]);
                        $overlayJson = (array) json_decode($pageArray['mobile_overlay_json']);
                        array_push($hideThisCta, $overlayJson["overlay"]->hide->mobile);
                    }
                    array_push($paymentPlan, $projectObject->payment_plan);
                    array_push($domainsEnabled, $projectObjectArray["client_url"]);
                    array_push($injectJs, $pageArray["inject_js"]);
                    array_push($transitionType, $overlayJson["transition"]);
                    array_push($triggerType, $overlayJson["timing"]->action);
                    array_push($triggerValue, $overlayJson["timing"]->value);
                    array_push($scrollLock, $overlayJson["overlay"]->lock->scroll);
                    array_push($clickLock, $overlayJson["overlay"]->lock->click);
                    array_push($targetAllUsers, $overlayJson["target"]->users);
                    array_push($schedulingRange, $overlayJson["schedule"]->range);
                    array_push($schedulingTime, $overlayJson["schedule"]->time);
                    array_push($schedulingHours, str_replace(",",";",str_replace('"',"'",json_encode($overlayJson["schedule"]->hours))));
                    array_push($schedulingStart, $overlayJson["schedule"]->start);
                    array_push($schedulingFinish, $overlayJson["schedule"]->finish);  
                    array_push($verticalPosition, $overlayJson["position"]->vertical);
                    array_push($horizontalPosition, $overlayJson["position"]->horizontal);
                    array_push($pageSelection, $overlayJson["position"]->pages->selection);
                    array_push($pageWhiteList, "[".implode(",",$overlayJson["position"]->pages->whitelist)."]");
                    array_push($pageBlackList, "[".implode(",",$overlayJson["position"]->pages->blacklist)."]");
                    array_push($dimBackground, $overlayJson["overlay"]->dimPage);
                    $mobileAlternator++;
                }
                $ctaIndex++;
            }
        }
        //Add extra base css to csstext
        $filename = $this->path."base.css";
        $file = fopen( $filename, "r" );
        if( $file == false ) {
           $logString .= "Error in opening base css file";
        }
        $filesize = filesize( $filename );
        $cssText .= fread($file, $filesize);
        fclose( $file );

        //Write user cta file
        $filename = $clientFolderPath.'/currentCTA.js';
        $file = fopen( $filename, "w" );
        if( $file == false ) {
           $logString .= "Error in opening currentCta file";
        }
        //Write desktop cta
        $filesize = filesize( $filename );
        fwrite($file,$triggerText.'aivaController.init({
               ctaName:"'.implode(",",$ctaName).'",
               clientEmail:"'.$clientEmail.'",
               persistCode:"'.$persistCode.'",
               paymentPlan:"'.implode(",",$paymentPlan).'",
               triggerType:"'.implode(",",$triggerType).'",
               triggerValue:"'.implode(",",$triggerValue).'",
               transitionType:"'.implode(",",$transitionType).'",
               domainsEnabled:"'.implode(",",$domainsEnabled).'",
               pageSelection:"'.implode(",",$pageSelection).'",
               pageWhiteList:"'.implode(",",$pageWhiteList).'",
               pageBlackList:"'.implode(",",$pageBlackList).'",
               scrollLock:"'.implode(",",$scrollLock).'",
               clickLock:"'.implode(",",$clickLock).'",
               targetAllUsers:"'.implode(",",$targetAllUsers).'",
               scheduleRange:"'.implode(",",$schedulingRange).'",
               scheduleTime:"'.implode(",",$schedulingTime).'",
               scheduleHours:"'.implode(",",$schedulingHours).'",
               scheduleStart:"'.implode(",",$schedulingStart).'",
               scheduleFinish:"'.implode(",",$schedulingFinish).'",
               horizontalPositioning:"'.implode(",",$horizontalPosition).'",
               verticalPositioning:"'.implode(",",$verticalPosition).'",
               dimBackground:"'.implode(",",$dimBackground).'",
               height:"'.implode(",",$ctaHeight).'",
               width:"'.implode(",",$ctaWidth).'",
               hideThisCta:"'.implode(",",$hideThisCta).'",
               html:"'.implode(",",$htmlArray).'",
               css:"'.$cssText.'",
               injectJs:"'.implode(",",$injectJs).'",
               videoJson:"'.implode(",break,",$videoJson).'",
               fonts:"'.$includeFonts.'"});');
        fclose( $file );
        chmod($filename, 0777);
        
        
        return new Response($logString,200);
    }
    
	/**
	 * Find a project by name or id.
	 * 
	 * @param  int/string $id
	 * @return Response
	 */
	public function show($id)
	{
		$project = $this->repo->find($id);

		if ($project) {
			return new Response($project, 200);
		}
	
		return new Response($this->app['translator']->trans('noProjectWithName'), 400);
	}

	/**
	 * Delete project with given id.
	 * 
	 * @param  int|string $id
	 * @return Response
	 */
	public function delete($id)
	{
		if ( ! $this->app['sentry']->getUser()->hasAccess('projects.delete')) {
			return new Response($this->app['translator']->trans('noPermProjectDelete'), 403);
		}

		$project = $this->repo->find((int)$id);

		if ($project->public) {
			return new Response($this->app['translator']->trans('noPermissionsToDeleteProject'), 403);
		}

		if ($project) {
                    // forcing to remove connection of projects to user
                    ProjectUsersModel::where('project_id', $project->id)->delete();
                    $project->pages()->delete(); 
                    $project->delete();
                    return new Response($this->app['translator']->trans('projectDeleteSuccess'), 204);
		}
	}
    
	/**
	 * Delete a page with given id.
	 * 
	 * @param  string/int $id
	 * @return Response
	 */
	public function deletePage($id)
	{
		return new Response($this->repo->deletePage($id), 204);
	}

	public function deleteAllPages($id)
	{
		return new Response($this->repo->deleteAllPages($id), 200);
	}
        
        public function rename($id, $name) {
            try {
                $this->log->info( 'Renaming campaign ' . $id.' to '.$name );

                return new Response( json_encode( 
                    $this->repo->rename($id, $name), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT 
                ), 200, array( 'Content-Type' => 'application/json' ));
                
            } catch (\Exception $e)  {
                
                $this->log->error( $e->getMessage().' '.$e->getTraceAsString() );
                
                return new Response( json_encode( array(
                    'error' => $e->getMessage()
                ), JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT ), 400, array(
                    'Content-Type' => 'application/json'
                ) );
            }
            
        }
}