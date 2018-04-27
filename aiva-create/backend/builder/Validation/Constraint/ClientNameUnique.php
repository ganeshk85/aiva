<?php

namespace Builder\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

class ClientNameUnique extends Constraint
{
    public $sentry = null;
    
    public $message = 'Must be unique';
}