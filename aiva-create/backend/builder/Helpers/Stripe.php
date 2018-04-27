<?php namespace Builder\Helpers;

use Silex\Application;
use Builder\Users\UserModel as User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Stripe\Stripe as StripeSDK;

class Stripe {

    /**
    * Silex application instance.
    *
    * @var Silex\Application
    */
    private $app;

    private $user;

    public $token;

    private $strip_key = 'sk_test_MQu5hnpGsrBbW8T4Rc7FcSvL';

    /**
    * Create new StripesController instance.
    *
    * @param Application $app
    * @param Request     $request
    */
    public function __construct($app) {
        $this->app = $app;
        $this->sentry = $app['sentry'];
        $this->user = $this->app['sentry']->getUser();

        // Set Stripe api key
        \Stripe\Stripe::setApiKey(getenv('STRIPE_KEY'));
    }

    public function subscribe($plan, $coupon = null) {
        // Get stripe_id
        $stripe_id = $this->customer();

        // Subscribe user to plan
        try {
            $subscription = \Stripe\Subscription::create(array(
                "customer" => $stripe_id,
                "plan" => $plan,
                "coupon" => $coupon
            ));
        }catch(\Stripe\Error\Card $e) {
            $response = json_encode([
              'status' => 'error',
              'message' => $e->getMessage()
            ]);

            exit($response);
        }

        // Make sure to change user account to pro
        $this->user->is_pro = 1;
        $this->user->save();

        return $subscription;
    }

    public function upgrade() {
        // Check if user is subscribed
        if( !$this->subscribed() ) {
            return 'User has no active subscription';
        }
        // Upgrade user's subscription
        // return boolean
    }

    public function cancel() {
        // Check if user is subscribed
        if( !$this->subscribed() ) {
            return 'User has no active subscription';
        }
        // Cancel user's subscription
        // return boolean
    }

    public function subscribed() {
        // Check if user is subscribed
        if($this->user->payment_plan == 'free') {
            return false;
        }

        return true;
    }

    # To do
    public function subscription($subscriptionId) {
        $subscription = \Stripe\Subscription::retrieve($subscriptionId);

        return $subscription;
    }

    public function customer() {
        // Create stripe customer if doesn't exist
        if(!$this->user->stripe_id) {
            try {
                $customer = \Stripe\Customer::create(array(
                    "email" => $this->user->email,
                    "card"  => $this->token
                ));

                $this->user->stripe_id = $customer->id;
                $this->user->last_four = $customer->sources->data[0]->last4;
                $this->user->save();
            }catch(\Stripe\Error\Card $e) {
                $response = json_encode([
                  'status' => 'error',
                  'message' => $e->getMessage()
                ]);

                exit($response);
            }
        }

        return $this->user->stripe_id;
    }

    public function getCustomer() {
        if(!$this->user->stripe_id) {
            $response = json_encode([
              'status' => 'error',
              'message' => 'There is no Stripe customer'
            ]);

            exit($response);
        }

        $customer = \Stripe\Customer::retrieve($this->user->stripe_id);

        return $customer;
    }

    public function changePlan($subscriptionId, $planId) {
        $subscription = \Stripe\Subscription::retrieve($subscriptionId);
        $subscription->plan = $planId;
        $subscription->save();

        return $subscription;
    }

    public function coupon($couponId) {
        return \Stripe\Coupon::retrieve($couponId);
    }
}
