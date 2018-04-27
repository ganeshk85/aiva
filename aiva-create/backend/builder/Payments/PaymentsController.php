<?php namespace Builder\Payments;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Builder\Users\UserModel as User;
use Builder\Users\UsersClientsModel as Clients;
use Builder\Helpers\Stripe;

class PaymentsController {

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

    private $user;

    private $stripe;

    /**
     * Create new PaymentsController instance.
     *
     * @param Application $app
     * @param Request     $request
     */
    public function __construct($app, Request $request, $sentry) {
        $this->app = $app;
        $this->sentry = $sentry;
        $this->request = $request;
        $this->input = $request->request;
        $this->user = $this->app['sentry']->getUser();

        $this->stripe = new Stripe($app);
    }

    /**
     * Make a new subscription
     */
    public function upgradeAccount(Request $request) {

        $this->stripe->token = $request->get('stripeToken');

        $subscription = $this->stripe->subscribe($request->get('plan'), $request->get('coupon'));

        $website = $this->user->clients()->first();

        $website->payment_plan = $subscription->plan->id;
        $website->subscription_id = $subscription->id;
        $website->subscription_ends_at = date("Y-m-d H:i:s", $subscription->current_period_end);
        $website->save();

        $response = new Response(json_encode([
            'status' => 'success'
        ]));

        return $response;
    }

    public function customer() {
        return new Response(json_encode($this->stripe->getCustomer()));
    }

    public function addCard(Request $request) {
        $customer = $this->stripe->getCustomer();
        $customer->sources->create(array("source" => $request->get('stripeToken')));

        return new Response(json_encode([
            'status' => 'success'
        ]));
    }

    public function deleteCard($cardId) {
        $customer = $this->stripe->getCustomer();
        $customer->sources->retrieve($cardId)->delete();

        return new Response(json_encode([
            'status' => 'success'
        ]));
    }

    public function makePrimary($cardId) {
        $customer = $this->stripe->getCustomer();
        $customer->default_source = $cardId;
        $customer->save();

        return new Response(json_encode([
            'status' => 'success'
        ]));
    }

    public function upgradeWebsite(Request $request) {
        $website = $this->user->clients()->find($request->get('website'));

        $subscription = $this->stripe->changePlan($website->subscription_id, $request->get('plan'));

        $website->payment_plan = $subscription->plan->id;
        $website->subscription_ends_at = date("Y-m-d H:i:s", $subscription->current_period_end);
        $website->save();

        return true;
    }

    public function coupon($couponId) {
        return new Response(json_encode($this->stripe->coupon($couponId)));
    }

    public function callback() {
        $input = @file_get_contents("php://input");
        $event_json = json_decode($input);

        $event = \Stripe\Event::retrieve($event_json->id);

        // Handle invoice payment success
        if (isset($event) && $event->type == "invoice.payment_succeeded") {
            $subscription = \Stripe\Subscription::retrieve($event->data->object->subscription);

            // Upgrade subscription renewal date
            $website = Clients::where('subscription_id', $subscription->id)->first();
            $website->subscription_ends_at = date("Y-m-d H:i:s", $subscription->current_period_end);
            $website->save();

            // Email customer
            $customer = \Stripe\Customer::retrieve($event->data->object->customer);
            $amount = sprintf('$%0.2f', $event->data->object->amount_due / 100.0);

            $text = "";
            $text .= "Hello $customer->name\n\r";
            $text .= "Thanks for your payment. This is a receipt for your latest AivaLabs payment.\n\r";
            $text .= "\n\r";
            $text .= "Amount: $amount\n\r";
            $text .= "Plan: $subscription->plan->name\n\r";
            $text .= "Domain: $website->client_url\n\r";
            $text .= "Renewal Date: $website->subscription_ends_at\n\r";
            $text .= "\n\r";
            $text .= "Thanks\n\r";
            $text .= "Aiva Team\n\r";

            $message = array(
                'from'    => 'Aiva Labs <no-reply@aivalabs.com>',
                'to'      => "$customer->name <$customer->email>",
                'subject' => 'Aiva Labs Payment Receipt!',
                'text'    => $text
            );
            $app['mailgun']->sendMessage($message);
        }

        // Handle subscription plan changes
        if (isset($event) && $event->type == "customer.subscription.updated") {
            $subscription = \Stripe\Subscription::retrieve($event->data->object->subscription);

            // Upgrade subscription renewal date
            $website = Clients::where('subscription_id', $subscription->id)->first();
            $website->subscription_ends_at = date("Y-m-d H:i:s", $subscription->current_period_end);
            $website->save();

            // Email customer
            $customer = \Stripe\Customer::retrieve($event->data->object->customer);
            $amount = sprintf('$%0.2f', $event->data->object->amount_due / 100.0);

            $text = "";
            $text .= "Hello $customer->name\n\r";
            $text .= "Thanks for your payment. This is a receipt for your latest AivaLabs payment.\n\r";
            $text .= "\n\r";
            $text .= "Amount: $amount\n\r";
            $text .= "Plan: $subscription->plan->name\n\r";
            $text .= "Domain: $website->client_url\n\r";
            $text .= "Renewal Date: $website->subscription_ends_at\n\r";
            $text .= "\n\r";
            $text .= "Thanks\n\r";
            $text .= "Aiva Team\n\r";

            $message = array(
                'from'    => 'Aiva Labs <no-reply@aivalabs.com>',
                'to'      => "$customer->name <$customer->email>",
                'subject' => 'Aiva Labs Payment Receipt!',
                'text'    => $text
            );
            $app['mailgun']->sendMessage($message);

        }

        // Handle invoice payment failure
        if (isset($event) && $event->type == "invoice.payment_failed") {
            $subscription = \Stripe\Subscription::retrieve($event->data->object->subscription);

            $website = Clients::where('subscription_id', $subscription->id)->first();

            // Email customer
            $customer = \Stripe\Customer::retrieve($event->data->object->customer);
            $amount = sprintf('$%0.2f', $event->data->object->amount_due / 100.0);

            $text = "";
            $text .= "Hello $customer->name\n\r";
            $text .= "We attempted to charge the card you have on file but were unable to do so. We will automatically attempt to charge your card again within 24-48 hours.\n\r";
            $text .= "If we couldn't charge your card after 5 days of your renewal date, your domain will be deleted.\n\r";
            $text .= "You can login to your account and update your card to avoid deleting your domain.\n\r";
            $text .= "\n\r";
            $text .= "Amount: $amount\n\r";
            $text .= "Plan: $subscription->plan->name\n\r";
            $text .= "Domain: $website->client_url\n\r";
            $text .= "Renewal Date: $website->subscription_ends_at\n\r";
            $text .= "\n\r";
            $text .= "Thanks\n\r";
            $text .= "Aiva Team\n\r";

            $message = array(
                'from'    => 'Aiva Labs <no-reply@aivalabs.com>',
                'to'      => "$customer->name <$customer->email>",
                'subject' => 'Aiva Labs - Failed to process Credit Card!',
                'text'    => $text
            );
            $app['mailgun']->sendMessage($message);

        }

        // Handle canceled subscription
        if (isset($event) && $event->type == "customer.subscription.deleted") {
            $subscription = $event->data->object;

            // Delete website
            $website = Clients::where('subscription_id', $subscription->id)->first();
            $website->delete();

            // Email customer
            $customer = \Stripe\Customer::retrieve($event->data->object->customer);

            $text = "";
            $text .= "Hello $customer->name\n\r";
            $text .= "This email is to inform you that your subscription has been canceled.\n\r";
            $text .= "\n\r";
            $text .= "Plan: $subscription->plan->name\n\r";
            $text .= "Domain: $website->client_url\n\r";
            $text .= "\n\r";
            $text .= "Thanks\n\r";
            $text .= "Aiva Team\n\r";

            $message = array(
                'from'    => 'Aiva Labs <no-reply@aivalabs.com>',
                'to'      => "$customer->name <$customer->email>",
                'subject' => 'Aiva Labs - Failed to process Credit Card!',
                'text'    => $text
            );
            $app['mailgun']->sendMessage($message);

        }

        http_response_code(200);
    }
}
