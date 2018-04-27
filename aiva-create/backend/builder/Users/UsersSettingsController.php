<?php namespace Builder\Users;

use Cartalyst\Sentry;
use Silex\Application;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Builder\Util\CurlRequest;
use Builder\Util\CanonicalUrl;

class UsersSettingsController {
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
     *
     * @var Builder\Validation\UserSettingsValidator
     */
    private $validator;

    private $app;

    private $jsonHeaders = array( 'Content-Type' => 'application/json');

    private $user;

    /**
     * Create new ProjectsController instance.
     *
     * @param Application $app
     * @param Request     $request
     */
    public function __construct($app, Request $request, $sentry, $validator) {
        $this->app = $app;
        $this->sentry = $sentry;
        $this->request = $request;
        $this->validator = $validator;
        $this->input = $request->request;
        $this->user = $this->sentry->getUser();
    }

    public function getProfile() {
        return new Response( $this->sentry->getUser(), 200, $this->jsonHeaders );
    }

    public function getTracking() {
	$objUser = $this->sentry->getUser();
        return new Response( json_encode( array(
		'tracking' => $objUser->tracking,
		'identity' => preg_replace( '/\$.+\$/', '', $objUser->persist_code)
	) ));
    }

    /**
     *
     * @param string $newUrl
     * @param string $oldUrl
     * @return string
     */
    public function validatedUrl($newUrl, $oldUrl) {
        if (!$newUrl) return;

        // we should turn this into valid visitable URL
        $u = new CanonicalUrl($newUrl);
        if ($oldUrl && $u->isSameAs($oldUrl)) return;

        if (!$u->hasScreenshot()) {
            // if we have no image for this URL yet
            // we should visit that URL, and check that URL response HTTP status is 200
            (new CurlRequest($newUrl))->get();

            // ok. here we've confirmed this is actually a valid URL
            $u->screenshot();
        }
        return $u->get();
    }

    public function updateProfile() {

        if ( $this->validator->fails( $this->input->all(), 'updateProfile' ) ) {
            return new Response(json_encode($this->validator->errors), 400);
        }

        $u = UserModel::find( $this->sentry->getUser()->id );
        $u->first_name = $this->input->get('first_name');
        $u->last_name = $this->input->get('last_name');
        $u->email = $this->input->get('email');
        $u->timezone = $this->input->get('timezone');
        $u->logo = $this->input->get('logo');
        $u->logo_squared = $this->input->get('logo_squared');
        $u->save();

        (new UserActivatedDomains($u))->save();
        return new Response( $u );
    }

    public function updatePassword() {
        if ( $this->validator->fails( $this->input->all(), 'updatePassword' ) ) {
            return new Response(json_encode($this->validator->errors), 400);
        }

        if ( ! $this->sentry->getUser()->checkPassword( $this->input->get('oldPassword'))) {
            return new Response(json_encode(array(
                'oldPassword' => 'Old password doesn\'t match'
            )), 400);
        }

        $user = UserModel::find( $this->sentry->getUser()->id );
        $user->password = $this->input->get('newPassword');
        $user->save();
        return new Response( $user );
    }

    protected function getUploadRootDir() {
        global $app;
        return $app['base_dir']. '/assets/images/users';
    }

    protected function isImage($extension) {
        return $extension == 'png'  || $extension == 'jpg' || $extension == 'jpeg';
    }

    protected function isInterlaced( $filename ) {
        $handle = fopen($filename, "r");
        $contents = fread($handle, 32);
        fclose($handle);
        return( ord($contents[28]) != 0 );
    }

    public function upload(Request $req) {
        $objUser = $this->sentry->getUser();
        try {

            $file = $req->files->get('file');
            $arr = array();
            $arr['field'] = $req->get('key');
            $arr['extension'] = strtolower( $file->guessExtension());
            $arr['pathname'] = $file->getPathname();
            $arr['original'] = $file->getClientOriginalName();

            $field = $arr['field'];
            $destination = $objUser->id.'-0'.date('ymdHis').'-'.$field.'.'. $arr['extension'];
            $arr['result'] = 'assets/images/users/'.$destination;

            if (!$this->isImage($arr['extension'])) {
                throw new \Exception('Uploaded file must be JPG or PNG image');
            }
            if ($arr['extension'] == 'png' && $this->isInterlaced($arr['pathname']) ) {
                throw new \Exception('Sorry, interlaced PNG cannot be used. '
                        .'Please re-save and re-upload it');
            }

            if ( $field === 'logo_squared' ) {
                list($width, $height) = getimagesize($arr['pathname']);
                if ( $width != $height ) {
                    throw new \Exception('Square image is required');
                }
            } else if ( $field === 'logo' ) {
                list($width, $height) = getimagesize($arr['pathname']);
                if ( $width < $height ) {
                    throw new \Exception('Logo height must be less than width');
                }
            }
            $file->move($this->getUploadRootDir(), $destination);
            if ( !file_exists($arr['result'])) {
                throw new \Exception('Sorry, some error occured. File was not copied');
            }

            return new Response( json_encode( $arr ));
        } catch (\Exception $e) {
             return new Response(json_encode(array(
                'error' => $e->getMessage()
            )), 400);
        }
    }

    public function colors(Request $req) {
        $objUser = $this->sentry->getUser();
        try {
            if ( $req->get('colors') ) {
                $objUser->colors = json_encode( $req->get('colors') );
                $objUser->save();
            }
            return new Response( json_encode( $objUser->toArray()));
        } catch (\Exception $e) {
             return new Response(json_encode(array(
                'error' => $e->getMessage()
            )), 400);           
        }
    }
    public function reportColor(Request $req) {
        $objUser = $this->sentry->getUser();
        try {
            if ( $req->get('color') ) {
                $objUser->report_color = $req->get('color');
                $objUser->save();
            }
            return new Response( json_encode( $objUser->toArray()));
        } catch (\Exception $e) {
             return new Response(json_encode(array(
                'error' => $e->getMessage()
            )), 400);           
        }
    }
    
    
    public function websiteColors(Request $req) {
        try {
            $sWebsite = $req->get('website');
            if ( $sWebsite && $req->get('colors') ) {
                // $objUser->colors = json_encode( $req->get('colors') );
                // $objUser->save();
            }
            return new Response( json_encode( array() ));
        } catch (\Exception $e) {
             return new Response(json_encode(array(
                'error' => $e->getMessage()
            )), 400);           
        } 
    }
}
