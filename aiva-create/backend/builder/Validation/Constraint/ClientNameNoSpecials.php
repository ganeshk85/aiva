<?php

namespace Builder\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

class ClientNameNoSpecials extends Constraint
{
     public $message = 'Latin letters and numeric characters are preferred';
}