<?php

namespace Builder\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ClientNameNoSpecialsValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint) {
        if (trim($value) == '') { return; }
        if ( !preg_match( '/^([\sA-Z\.\-0-9]+)$/i', $value )) { 
            $this->context->buildViolation($constraint->message)
                ->setParameter('%string%', $value)
                ->addViolation();
        }
}}