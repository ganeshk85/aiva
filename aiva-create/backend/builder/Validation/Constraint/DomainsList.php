<?php

namespace Builder\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

class DomainsList extends Constraint
{
    public $message = 'Valid Domain URL expected.';
}

