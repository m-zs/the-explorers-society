import { BadRequestException, ValidationError } from '@nestjs/common';
export type CustomValidationError = { property: string; errors: string[] };

export const getPrettyClassValidatorErrors = (
  validationErrors: ValidationError[],
  parentProperty = '',
): CustomValidationError[] => {
  const errors: CustomValidationError[] = [];

  const getValidationErrorsRecursively = (
    validationErrors: ValidationError[],
    parentProperty = '',
  ) => {
    for (const error of validationErrors) {
      const propertyPath = parentProperty
        ? `${parentProperty}.${error.property}`
        : error.property;

      if (error.constraints) {
        errors.push({
          property: propertyPath,
          errors: Object.values(error.constraints),
        });
      }

      if (error.children?.length) {
        getValidationErrorsRecursively(error.children, propertyPath);
      }
    }
  };

  getValidationErrorsRecursively(validationErrors, parentProperty);

  return errors;
};

export const exceptionFactory = (validationErrors: ValidationError[] = []) => {
  const errors = getPrettyClassValidatorErrors(validationErrors);

  return new BadRequestException({
    message: 'Validation error',
    errors: errors,
  });
};
