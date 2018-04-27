<?php  namespace Builder\Plans;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Stripe\Stripe;

class PlansController {

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

  // private $servername = "127.0.0.1";
  // private $username = "root";
  // private $password = "";
  // private $database = "architect";
  private $stripe;

  // private $conn = new mysqli($servername, $username, $password, $database);


  public function __construct ($app, Request $request, $sentry)
  {
    $this->app = $app;
    $this->sentry = $sentry;
    $this->request = $request;
    $this->input = $request->request;
    // $this->creator = $creator;
    $stripe = array(
      "secret_key"      => "sk_test_2eC6izIK70M4nWGMZyitW8No",
      "publishable_key" => "pk_test_kwmQAcHmUbVvW98mhZh0wOP0"
    );

    \Stripe\Stripe::setApiKey($stripe['secret_key']);
  }

  // transaction
  public function plan ($plan, $stripe_token)
  {
    $user = $this->sentry->getUser();
    $cu = fetchCustomer();

    // coupon applied in preview stage
    // coupon($coupon, $cu);

    $subscription = \Stripe\Subscription::retrieve($cu->subscriptions->data[0]->id);

    if ($stripe_token) // just got their card
    {
      // $cu->source = $_POST['stripeToken'];
      // $cu->source = $this->input->get('stripeToken');
      $cu->source = $stripe_token;
      changePlan($subscription, $plan);

    }
    else if (!empty($cu->sources->data[0]))  // we already have their credit card
    {
      // where the action happens
      changePlan($subscription, $plan);
    }
    else if (!($plan == "free-monthly")) // no payment, no plan
    {

      // catch(\Exception $e)
      // echo "Sign up error: " . $e;
      // return new Response("Sign up error: " . $e->getMessage(), 200);
      // error_log("unable to sign up customer:" . $user->email .", error:" . $e->getMessage());
      // return new Response("Subscription Exists", 200);

    }
    else  // no payment, but switching to free plan
    {
      $subscription->plan = "free-monthly";
      $subscription->prorate = false;
      $subscription->save();

    }

    $cu->save();

    $user->update(array('payment_plan' => $cu->plan));

  }

  // private function newCustomer($userId)
  private function newCustomer()
  {
    $user = $this->sentry->getUser();
    $cu = \Stripe\Customer::create(array(
      "email" => $user->email
    ));

    \Stripe\Subscription::create(array(
      "customer" => $cu->id,
      "plan" => "free-monthly"
    ));

    $user->update(array(
      'stripe_id' => $cu->id,
      'payment_plan' => "free-monthly"
    ));

    return $cu;
  }

  private function fetchCustomer() {
    // retrieve customer id from database using userId

    // $row = $this->fetchRow('SELECT stripe_id FROM users WHERE email="' . $userId . '"');
    $user = $this->sentry->getUser();
    try {
      // $cid = $row['stripe_id'];
      $cid = $user->stripe_id;
      if (empty($cid))
      {
        $cu = newCustomer();
      }
      else {
        $cu = \Stripe\Customer::retrieve($cid);
      }
      // getUser()->stripe_id;
    }
    catch(\Exception $e)
    {
      $cu = newCustomer();
      // return new Response("creating new user", 200);
    }

    return $cu;

  }

  // apply coupon
  private function coupon($code, $cu)
  {
    if ($code != "")
    {
        $cu->"discount" => $code;
        $cu->save();
    }
  }

  public function estimate($planId, $promo)
  {

    $cu = fetchCustomer();

    $proration_date = time();  // i.e. now

    if ($promo != "")
    {
      coupon($promo, $cu);
    }

    $subId = $cu->subscriptions->data[0]->id;

    $subscription = \Stripe\Subscription::retrieve($subId);

    if (prorate($subscription, $planId))
    {

      // See what the next invoice would look like with a plan switch
      // and proration set:
      $invoice = \Stripe\Invoice::upcoming(array(
        "customer" => $cu->id,
        "subscription" => $subId,
        "subscription_plan" => $planId, # Switch to new plan
        "subscription_proration_date" => $proration_date
        // TODO: fix me
      ));
    }
    else
    {
      $invoice = \Stripe\Invoice::upcoming(array(
        "customer" => $cu->id,
        "subscription" => $subId,
        "subscription_plan" => $planId, # Switch to new plan
        "subscription_prorate" => false
        // TODO: fix me
      ));
    }

    // Calculate the proration cost:
    $cost = 0;
    $current_prorations = array();
    foreach ($invoice->lines->data as $line) {
      if ($line->period->start == proration_date) {
        array_push($current_prorations, $line);
        $cost += $line->amount;
      }
    }
    return new Response($cost, 200);
  }

  // Rules:
  // 1. NEVER prorate if downgrading (scale -> pro)
  // 2. ALWAYS prorate if upgrading (pro -> scale)
  // 3. when reducing cycle, you probably should prorate (yearly -> monthly)
  // 4. when increasing cycle, you probably should not prorate (monthly -> yearly) [to save them money]
  // Note: sub=before, plan=after
  private function prorate($subscription, $plan)
  {
    $subId = $subscription->plan->id;

    $planAr = explode("-", $plan);
    $subAr = explode("-", $subId);

    if ($subId == "free-monthly")
    {
      return true;
    }
    else if ($subAr[1] == $planAr[1])
    {
      if ($planAr[1] == "monthly")  // decreasing cycle
      {
        return false;
      }
      else  // increasing cycle
      {
        return true;
      }
    }
    else  // different plans
    {
      $plan1 = \Stripe\Plan::retrieve($subId);
      $plan2 = \Stripe\Plan::retrieve($plan);

      if ($plan1->amount > $plan2->amount)
      {
        // downgrading
        return false;
      }
      else // ($plan1->amount < $plan2->amount)
      {
        // upgrading
        return true;
      }
    }
    return true; // already default
  }

  // when someone makes a stripe customer object through the pricing page
  // this associates the stripe customer account with the newly created account
  public function addStripeToUser($stripe_id)
  {
    $user = $this->sentry->getUser();
    $user->stripe_id = $stripe_id;

    $cu = \Stripe\Customer::retrieve($stripe_id);
    $cu->email = $user->email;
    $cu->save();

  }
  private function changePlan($subscription, $plan)
  {
    $prorate = prorate($subscription, $plan);
    if ($prorate)
    {
      $subscription->prorate = true;  // probably is default
    }
    else
    {
      $subscription->prorate = false;
    }

    $subscription->plan = $plan;
    $subscription->save();
    $permissions = json_decode($user->permissions);

    $subPermissions = \Stripe\Plan::retrieve($plan)->metadata;

    $user = $this->sentry->getUser();

    foreach ($subPermissions as $key => $value) {

      $permissions->$key = $value;
    }
    $user->update(array(
      'payment_plan' => $plan,
      'permissions' => $permissions
    ));

  }

  // no need for cancellation. Instead of cancel, downgrade to free-monthly
  /*
  private function cancelSubscription()
  {
    $cu = fetchCustomer();
    $sub = $cu->subscriptions->data[0]->id;
    $subscription = \Stripe\Subscription::retrieve($sub);
    $subscription->cancel();
  }
  */

/*
  // TODO: make webhook work
  public function payHook() {
    // Retrieve the request's body and parse it as JSON
    $input = file_get_contents("php://input");
    $event_json = json_decode($input);

    $event = \Stripe\Event::retrieve($event_json->id);

    http_response_code(200);

    // nullify the plan
    if ($_POST['type'] == "charge.failed") {
      $sql = 'UPDATE users '.
          'SET stripe_plan="' . "NULL" .
          '" WHERE email="' . $userId . '";';

      global $conn;

      if ($conn->query($sql) === TRUE) {
          echo "Record updated successfully";
      } else {
          echo "Error updating record: " . $conn->error;
      }
    }
  }*/

  public function addSource($stripe_token)
  {

    $user = $this->sentry->getUser();
    $cu = fetchCustomer();

    // add another source
    $cu->source = $stripe_token;
  }


  // return the subscription status with Stripe and re-write it to the database
  public function refreshSub()
  {
    $cu = fetchCustomer();
    $plan = $cu->subscriptions->data[0]->plan->id;

    $user->update(array('payment_plan' => $plan));

  }

  // $conn->close();

}

 ?>
