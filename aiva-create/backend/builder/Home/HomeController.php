<?php namespace Builder\Home;

use Silex\Application;
use Builder\Pages\PageModel;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class HomeController {

	/**
	 * Sentry instance.
	 * 
	 * @var Cartalyst\Sentry\Sentr
	 */
	private $sentry;

	/**
	 * Application container instance.
	 * 
	 * @var Silex\Application
	 */
	private $app;

	/**
	 * Symfonys finder.
	 * 
	 * @var Symfony\Component\Finder\Finder
	 */
	private $finder;

	/**
	 * Create new HomeController instance.
	 * 
	 * @param Application $app    
	 * @param Request     $request
	 */
	public function __construct(Application $app, $sentry, $finder)
	{	
		$this->app = $app;
		$this->sentry = $sentry;
		$this->finder = $finder;
	}

        
        private function fileSearch($folder, $pattern) {
            $dir = new \RecursiveDirectoryIterator($folder);
            $ite = new \RecursiveIteratorIterator($dir);
            $files = new \RegexIterator($ite, $pattern, \RegexIterator::GET_MATCH);
            $fileList = array();
            foreach($files as $file) {
                $fileList = array_merge($fileList, $file);
            }
            return $fileList;
        }

	/**
	 * Main app page.
	 * 
	 * @return Response
	 */
	public function index()
	{
            $arrInlineTemplates = $this->fileSearch('views', '/[^\.]+\.html$/');
            $strScriptsMerged = '';
            foreach ( $arrInlineTemplates as $sPath) {
                $sPath = str_replace( '\\', '/', $sPath ); // for windows
                if ( strstr( $sPath, '/install/' ) ) { continue; }
                if ( strstr( $sPath, '/plans/' ) ) { continue; }
                if ( $sPath == 'views/builder/cta-base.html' ) { continue; }
                // add more exclusions if you see bugs there...
                
                if ( !file_exists( $this->app['base_dir'] . '/'. $sPath )) { continue; }
                $strScriptsMerged .= '<script type="text/ng-template" id="'.$sPath.'">' . "\n" .
                    file_get_contents( $this->app['base_dir'] . '/'. $sPath ) . "\n" .
                    '</script>'."\n";
            }
            $response = new Response( $this->app['twig']->render('main.twig.html', array( 
                'htmlinline' => $strScriptsMerged
            )));
            $response->headers->clearCookie('blUser');
            $user = $this->sentry->getUser();
            if (is_object($user)) {
                    $response->headers->setCookie(new Cookie('blUser', $user, 0, '/', null, false, false));
            }
	    return $response;
	}

	/**
	 * Parse and compile all custom elements in elements folder.
	 * 
	 * @return Response
	 */
	public function customElements()
	{
		$elements = array();

		$files = $this->finder->in($this->app['base_dir'].'/elements')->files();

		foreach ($files as $file) {
			$contents = $file->getContents();

			preg_match('/<script>(.+?)<\/script>/s', $contents, $config);
			preg_match('/<style.*?>(.+?)<\/style>/s', $contents, $css);
			preg_match('/<\/style.*?>(.+?)<script>/s', $contents, $html);
			
			if ( ! isset($config[1]) || ! isset($html[1])) {
				continue;
			}

			$elements[] = array(
				'css' => isset($css[1]) ? trim($css[1]) : '',
				'html' => trim($html[1]),
				'config' => trim($config[1])
			);
		}
		
		return new Response(json_encode($elements));
	}
}