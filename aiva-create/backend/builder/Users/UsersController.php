<?php namespace Builder\Users;

use Firebase\JWT\JWT;
use Silex\Application;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UsersController {

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

	private $app;

	/**
	 * Create new ProjectsController instance.
	 *
	 * @param Application $app
	 * @param Request     $request
	 */
	public function __construct($app, Request $request, $sentry, $validator, $creator)
	{
		$this->app = $app;
		$this->sentry = $sentry;
		$this->request = $request;
		$this->validator = $validator;
		$this->input = $request->request;
                $this->creator = $creator;
	}

	public function index()
	{
		if ($this->sentry->getUser()->hasAccess('users.update')) {
			return UserModel::all();
		}

		return $this->app['translator']->trans('noPermissionsGeneric');
	}

	public function delete($id)
	{
		$u = $this->sentry->getUser();

		if ($u->hasAccess('users.delete') && $u->id != $id) {
			return UserModel::destroy($id);
		}

		return new Response($this->app['translator']->trans('noPermissionsGeneric'), 403);
	}

        protected $sServerName = 'AivaLabs';
        protected $sSecretKey = '0230230202303202302024898484844848ASDFASDF';

        private function getNewTokenForUser($user, $nLifeTime = 60) {
            $tokenId    = base64_encode(mcrypt_create_iv(32));
            $issuedAt   = time();
            $notBefore  = $issuedAt + 1;                 // Adding 1 second
            $expire     = $notBefore + $nLifeTime; // Adding $nLifeTime seconds
            $serverName = $this->sServerName;     // Retrieve the server name from config file
						$plan = "free-monthly";

						if (!empty($user->payment_plan)) {
							$plan = $user->payment_plan;
						}
            /*
             * Create the token as an array
             */
            $data = [
                'iat'  => $issuedAt,         // Issued at: time when the token was generated
                'jti'  => $tokenId,          // Json Token Id: an unique identifier for the token
                'iss'  => $serverName,       // Issuer
                'nbf'  => $notBefore,        // Not before
                'exp'  => $expire,           // Expire
                'data' => [                  // Data related to the signer user
                    'userId'   => $user->id, // user id from the users table
                    'userEmail' => $user->email, // User email
										'userPlan' => $plan
                ]
            ];
            $jwt = JWT::encode(
                $data,      //Data to be encoded in the JWT
                $this->sSecretKey, // The signing key
                'HS512'     // Algorithm used to sign the token, see https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40#section-3
            );
            return $jwt;
        }

        public function getToken()
	{
            $creds = $this->input->all();
            //do some basic validation just in case
            if ($this->validator->fails($creds, 'login')) {
                    return new Response(json_encode($this->validator->errors), 400);
            }
            $error = array();
            try {
                $user = $this->sentry->authenticate($creds, true);
            } catch (\Cartalyst\Sentry\Users\WrongPasswordException $e) {
                $error['*'] = $this->app['translator']->trans('wrongEmailOrPassword');
            } catch (\Cartalyst\Sentry\Users\UserNotFoundException $e) {
                $error['*'] = $this->app['translator']->trans('wrongEmailOrPassword');
            } catch (\Cartalyst\Sentry\Throttling\UserSuspendedException $e) {
                $error['*'] = $this->app['translator']->trans('userSuspended');
            } catch (\Cartalyst\Sentry\Throttling\UserBannedException $e) {
                $error['*'] = $this->app['translator']->trans('userBanned');
            }

            if (count($error)) {
                return new Response(json_encode($error), 400);
            }

            $response = new Response( $this->getNewTokenForUser($user, 120), 200);
            return $response;
	}

        public function loginWithToken() {
            try {
                $token = $this->input->get('token');
                if ( !$token ) {
                    throw new \Exception('Cannot login without token');
                }

                $decoded = JWT::decode($token, $this->sSecretKey, array( 'HS512' ) );
                if ( $decoded->exp < time() ) {
                    throw new \Exception('Sorry, token was expired. Please go back and try again');
                }
                $user = UserModel::find($decoded->data->userId);
                if ( !is_object( $user ) ) {
                    throw new \Exception('Sorry, user was not found by its id');
                }

                $sentryuser = $this->sentry->login($user, true);
                $html = '<script>top.location.href="../#/campaigns/all/table";</script>';
                $response = new Response($html, 200);
                $response->headers->setCookie(new Cookie('blUser', $sentryuser, 0, '/', null, false, false));
                return $response;
            } catch ( \Exception $e ) {
                return new Response( 'Error:'. $e->getMessage(), 400);
            }
        }

		public function firstLoginWithToken() {
            try {
                $token = $this->input->get('token');

                if ( !$token ) {
                    throw new \Exception('Cannot login without token');
                }

				$userUrl = $this->input->get('userUrl');
				if ( !$userUrl ) {
                    throw new \Exception('Cannot do first login without user url');
                }

                $firstName = $this->input->get('firstName');
				if ( !$userUrl ) {
                    throw new \Exception('Cannot do first login without first name');
                }

                $lastName = $this->input->get('lastName');
				if ( !$userUrl ) {
                    throw new \Exception('Cannot do first login without last name');
                }

                $decoded = JWT::decode($token, $this->sSecretKey, array( 'HS512' ) );
                if ( $decoded->exp < time() ) {
                    throw new \Exception('Sorry, token was expired. Please go back and try again');
                }
                $user = UserModel::find($decoded->data->userId);
                if ( !is_object( $user ) ) {
                    throw new \Exception('Sorry, user was not found by its id');
                }

                try {
                    $sentryuser = $this->sentry->login($user, true);
                } catch ( \Exception $e ) {
                    header("Refresh:0");
                    $sentryuser = $this->sentry->login($user, true);
                }

                $html = '<script>top.location.href="../#/settings/profile";</script>';
                $response = new Response($html, 200);
                $response->headers->setCookie(new Cookie('blUser', $sentryuser, 0, '/', null, false, false));
				$user->update(array('user_url' => str_replace ( array('http://','https://') , '' , $userUrl)));
				$user->update(array('first_name' => $firstName));
				$user->update(array('last_name' => $lastName));
				$user->update(array('timezone' => '(GMT-05:00) Eastern Time (US & Canada)'));

                return $response;
            } catch ( \Exception $e ) {
                return new Response( 'Error:'. $e->getMessage(), 400);
            }
        }

	public function login()
	{
		$creds = $this->input->all();

		//do some basic validation just in case
		if ($this->validator->fails($creds, 'login')) {
			return new Response(json_encode($this->validator->errors), 400);
		}

		$error = array();

		try {
			$user = $this->sentry->authenticate($creds, true);
		}
		catch (\Cartalyst\Sentry\Users\WrongPasswordException $e) {
		    $error['*'] = $this->app['translator']->trans('wrongEmailOrPassword');
		}
		catch (\Cartalyst\Sentry\Users\UserNotFoundException $e) {
		    $error['*'] = $this->app['translator']->trans('wrongEmailOrPassword');
		}
		catch (\Cartalyst\Sentry\Throttling\UserSuspendedException $e) {
		    $error['*'] = $this->app['translator']->trans('userSuspended');
		}
		catch (\Cartalyst\Sentry\Throttling\UserBannedException $e) {
		    $error['*'] = $this->app['translator']->trans('userBanned');
		}

		if (count($error)) {
			return new Response(json_encode($error), 400);
		}
// \Builder\Util\Debug::msg( $user );
		$response = new Response($user, 200);
		$response->headers->setCookie(new Cookie('blUser', $user, 0, '/', null, false, false));

		return $response;
	}

	/**
	 * Register a new user.
	 *
	 * @return Response
	 */
	public function store()
	{
        $registrationEnabled = isset($this->app['settings']['enable_registration']) ? $this->app['settings']['enable_registration'] : true;

        //if registration is disabled and we don't have logged in admin, bail
		if ( ! $registrationEnabled && ! ($this->sentry->getUser() && $this->sentry->getUser()->hasAccess('users.create'))) {
			return new Response($this->app['translator']->trans('registrationDisabled'), 403);
		}

        //if basic validation fails return errors
		if ($this->validator->fails($this->input->all(), 'register')) {
			return new Response(json_encode($this->validator->errors), 400);
		}

        //create a new user
		try {
			$user = $this->creator->create($this->input->all());
		} catch (\Cartalyst\Sentry\Users\UserExistsException $e) {
		    return new Response(json_encode(array('email' => $this->app['translator']->trans('emailTaken'))), 400);
		}

		$response = new Response($user, 200);

        //set cookie on response with new user data
	    $response->headers->setCookie(new Cookie('blUser', $user, 0, '/', null, false, false));

		return $response;
	}

	public function modifyPermissions($id)
	{
		if ($this->app['is_demo']) {
			return new Response('Permission modifications are disabled on demo site.', 403);
		}

		if ($this->sentry->getUser()->hasAccess('users.update')) {
			$user = UserModel::find($id);

			//only superusers can modify other superusers permissions
			if ( ! $user || ($user->isSuperUser() && ! $this->sentry->getUser()->isSuperUser())) {
				return $this->app['translator']->trans('noPermissionsGeneric');
			}

			$user->update(array('permissions' => $this->input->get('permissions')));

			return new Response('Permissions modified successfully.', 201);
		}

		return $this->app['translator']->trans('noPermissionsGeneric');
	}

    public function modifyActivatedCtas($id)
	{
		if ($this->app['is_demo']) {
			return new Response('Permission modifications are disabled on demo site.', 403);
		}

		if ($this->sentry->getUser()->hasAccess('export')) {
			$user = UserModel::find($id);

			$user->update(array('activated_ctas' => $this->input->get('activated_ctas')));

			return new Response('Active ctas modified successfully.', 201);
		}

		return $this->app['translator']->trans('noPermissionsGeneric');
	}

	public function assignPermissionsToAll()
	{
		if ( ! $this->sentry->getUser()->hasAccess('superuser') || ! $this->input->has('permissions')) {
			return new Response($this->app['translator']->trans('noPermissionsGeneric'), 403);
		}

		UserModel::whereNull('permissions')->update(array('permissions' => $this->input->get('permissions')));

		return new Response($this->app['translator']->trans('permissionsUpdated'), 200);
	}

	public function logout()
	{
		$this->sentry->logout();

		$response = new Response();
		$response->headers->clearCookie('blUser');

		return $response;
	}
}
