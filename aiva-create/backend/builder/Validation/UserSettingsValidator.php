<?php

namespace Builder\Validation;

use Symfony\Component\Validator\Constraints as Assert;
use Builder\Validation\Constraint\DomainsList;

class UserSettingsValidator {

    public $errors = array();
    private $app;
    private $validator;
    private $user;

    public function __construct($app, $validator) {
        $this->app = $app;
        $this->validator = $validator;
        $this->user = $this->app['sentry']->getUser();

        $this->minMax = array(
            'min' => 4,
            'max' => 50,
            'minMessage' => $this->app['translator']->trans('4CharsMin'),
            'maxMessage' => $this->app['translator']->trans('50CharsMax'),
        );
    }

    /**
     * Validation rules for submitting user profiles
     * Only name, email and timezone expected
     *
     * @return Assert\Collection
     */
    private function updateProfile(array $data) {
        return new Assert\Collection(array(
            'fields' => array(
                'first_name' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                ),
                'last_name' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                ),
                'timezone' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                ),
                'email' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                    new Assert\Email(array('message' => $this->app['translator']->trans('notValidEmail')))
                ),
                'logo' => array(
                    new Assert\Optional()
                ),
                'logo_squared' => array(
                    new Assert\Optional()
                )
            )
            // 'missingFieldsMessage' => $this->app['translator']->trans('fieldCantBeEmpty'),
        ));
    }

    /**
     * Validation rules for user registration.
     *
     * @return Assert\Collection
     */
    private function updatePassword(array $data) {
	if ( ! isset($data['newPassword'])) {
            $data['newPassword'] = '';
        }

        return new Assert\Collection(array(
            'fields' => array(
                'oldPassword' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                ),
                'newPassword' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                    new Assert\Length($this->minMax),
                ),
                'confirmPassword' => array(
                    new Assert\NotBlank(array('message' => $this->app['translator']->trans('shouldntBeBlank'))),
                    new Assert\Length($this->minMax),
                    new Assert\EqualTo(array('value' => $data['newPassword'], 'message' => $this->app['translator']->trans('passwordsDontMatch'))),
                ),
            )
            // 'missingFieldsMessage' => $this->app['translator']->trans('fieldCantBeEmpty'),
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
