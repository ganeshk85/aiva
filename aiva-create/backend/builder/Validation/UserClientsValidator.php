<?php

namespace Builder\Validation;

use Symfony\Component\Validator\Constraints as Assert;
use Builder\Validation\Constraint\ClientNameNoSpecials;
use Builder\Validation\Constraint\ClientNameUnique;

class UserClientsValidator {

    public $errors = array();
    private $app;
    private $validator;
    private $sentry;

    public function __construct($app, $validator, $sentry) {
        $this->app = $app;
        $this->validator = $validator;
        $this->sentry = $sentry;

        $this->minMax = array(
            'min' => 4,
            'max' => 50,
            'minMessage' => $this->app['translator']->trans('4CharsMin'),
            'maxMessage' => $this->app['translator']->trans('50CharsMax'),
        );
    }

    /**
     * Validation rules for submitting user client record
     * Only user_id', 'client_name', 'client_url', 'client_timezone
     *
     * @return Assert\Collection
     */
    private function check() {
        return new Assert\Collection(array(
            'fields' => array(
//                'user_id' => array(
//                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
//                ),
                'client_name' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                    new ClientNameNoSpecials(),
                    new ClientNameUnique(array( 'sentry' => $this->sentry )),
                ),
                'client_url' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                ),
                'client_timezone' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                ),
                'plan' => array(
                    new Assert\Optional()
                ),
                'coupon' => array(
                    new Assert\Optional()
                )
            )
        ));
    }

    public function fails(array $data, $rules) {
        $this->errors = array();

        foreach ($this->validator->validateValue($data, $this->$rules($data)) as $error) {
            $field = str_replace(array('[', ']'), '', $error->getPropertyPath());
            $this->errors[$field] = $error->getMessage();
        }

        return (boolean) count($this->errors);
    }

}
