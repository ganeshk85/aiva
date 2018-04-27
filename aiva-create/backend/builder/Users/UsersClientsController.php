<?php namespace Builder\Users;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Builder\Validation\UserClientsValidator;
use Builder\Util\CurlRequest;
use Builder\Util\CanonicalUrl;
use Builder\Helpers\Stripe;

class UsersClientsController {
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
    * @var UserClientsModel
    */
   private $model;

   private $app;

   /**
    * Create new UsersClientsController instance.
    *
    * @param Application $app
    * @param Request     $request
    */
   public function __construct($app, Request $request, $sentry, UserClientsValidator $validator, UsersClientsModel $model) {
       $this->app = $app;
       $this->sentry = $sentry;
       $this->request = $request;
       $this->validator = $validator;
       $this->input = $request->request;
       $this->model = $model;
       $this->user = $this->app['sentry']->getUser();
   }

   public function index() {
       return new Response(
            UsersClientsModel::whereuser_id( $this->sentry->getUser()->id )
            ->orderBy('client_sortorder')->orderBy('client_name')
            ->get() );
   }

    /**
    * Find a user clients record by its id.
    * @param  int $id
    * @return Response
    */
    public function show($id){
        $record = UsersClientsModel::whereuser_id( $this->sentry->getUser()->id )->whereid($id)->get();
        if (is_object($record)) { return new Response($record, 200); }
        return new Response( "No such user client", 400);
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
    /**
    * Create user clients
    * @param  int $id
    * @return Response
    */
    public function store(){
        if ( $this->validator->fails( $this->input->all(), 'check' ) ) {
            return new Response(json_encode($this->validator->errors), 400);
        }
        try {
            $model = new UsersClientsModel();
            $model->user_id = $this->sentry->getUser()->id;
            $model->client_name = $this->input->get('client_name');
            $clientUrl = $this->validatedUrl($this->input->get('client_url'), $model->client_url);
            $model->client_url = $clientUrl;
            $model->client_timezone = $this->input->get('client_timezone');
            $model->created = date('Y-m-d H:i:s');
            $model->updated = date('Y-m-d H:i:s');

            if($this->user->is_pro) {
                $stripe = new Stripe($this->app);
                $subscription = $stripe->subscribe($this->input->get('plan'), $this->input->get('coupon'));

                $model->payment_plan = $subscription->plan->id;
                $model->subscription_id = $subscription->id;
                $model->subscription_ends_at = date("Y-m-d H:i:s", $subscription->current_period_end);
            }else{
                if($this->user->clients()->count() >= 1) {
                    throw new \Exception('User already has 1 domain');
                }
                $model->payment_plan = 'free';
            }

            $model->save();

            $u = UserModel::find( $this->sentry->getUser()->id );
            (new UserActivatedDomains($u))->save();
        } catch (\Exception $e) {
            return new Response(json_encode(array( $e->getMessage())), 400);
        }

        return $model;
    }

    /**
    * Update user clients record by its id.
    * @param  int $id
    * @return Response
    */
    public function update($id){
        if ( $this->validator->fails( $this->input->all(), 'check' ) ) {
           return new Response(json_encode($this->validator->errors), 400);
        }
        try {
            $model = $this->model->find($id);
            if ( is_object( $model )) {
                if ( $model->user_id != $this->sentry->getUser()->id &&
                    ! $this->sentry->getUser()->hasAccess('superuser') ) {
                    return new Response(json_encode( array( 'no_perm' => 'No permissions to edit this user')), 400);
                }

                $clientUrl = $this->validatedUrl($this->input->get('client_url'), $model->client_url);

                $model->fill(array(
                    'client_name' => $this->input->get('client_name'),
                    'client_url' => $clientUrl,
                    'client_timezone' => $this->input->get('client_timezone'),
                    'updated' => date('Y-m-d H:i:s')
                ))->save();
                return new Response( $model, 200 );
            }
        } catch (\Exception $e) {
            return new Response(json_encode(array( $e->getMessage())), 400);
        }
        return new Response( "No such user client", 400);
    }

    /**
    * Delete user clients record by its id.
    * @param  int $id
    * @return Response
    */
    public function delete($id){
        $model = $this->model->find($id);
        if (is_object($model)) {
            if ( $model->user_id != $this->sentry->getUser()->id &&
               ! $this->sentry->getUser()->hasAccess('superuser') ) {
                return new Response(json_encode( array( 'no_perm' => 'No permissions to edit this user')), 400);
            }

            // Cancel subscription if pro
            if($model->payment_plan != 'free') {
                $stripe = new Stripe($this->app);
                $subscription = $stripe->subscription($model->subscription_id);
                $subscription->cancel();
            }

            $model->delete();

            $u = UserModel::find( $this->sentry->getUser()->id );
            (new UserActivatedDomains($u))->save();
            return new Response( '[]', 200);
        }
        return new Response( "No such user client", 400);
    }

}
