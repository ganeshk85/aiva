<?php

namespace Builder\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Builder\Users\UsersClientsModel;

class ClientNameUniqueValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint) {
        if (trim($value) == '') { 
            $this->context->buildViolation($constraint->message)->addViolation();
            return; 
        }
        
        if ( !is_object( $constraint->sentry) && 
              is_object( $constraint->sentry->getUser() ) ) {
            $this->context->buildViolation( 'User not logged in' )->addViolation();
            return;
        }

        if ( !$constraint->sentry->getUser()->getId() ) {
            $this->context->buildViolation( 'User login error' )->addViolation();
            return;
        }
        
        $existing = UsersClientsModel::whereuser_id( $constraint->sentry->getUser()->getId() )
                ->whereclient_name( trim( $value ))->get();
        
        if ( count( $existing ) > 0 ) {
            $this->context->buildViolation( $constraint->message )->addViolation();
        }
    }
}