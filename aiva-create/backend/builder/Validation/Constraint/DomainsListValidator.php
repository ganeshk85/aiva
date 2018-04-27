<?php

namespace Builder\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class DomainsListValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint) {
        if (trim($value) == '') { return; }
        if (!strstr( $value, '://') ) { $value = 'http://'.$value; }
        
        if ( !strstr($value, '.') || strstr($value, ',') 
             || ! filter_var( $value, FILTER_VALIDATE_URL )) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('%string%', $value)
                ->addViolation();
        }
       
    }

}

