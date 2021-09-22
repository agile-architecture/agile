import * as Yup from 'yup';
import { Validator } from '../../validator';
import { generateId } from '@agile-ts/core';

/**
 * Returns a Validator created based on the specified Yup schema.
 *
 * @param schema - Yup schema.
 */
export function yupResolver(schema: Yup.BaseSchema): Validator {
  const validator = new Validator();

  // Add validation method to the created Validator
  validator.addValidationMethod(
    `yup_${generateId()}`,
    async (toValidateItemKey, value, editor) => {
      let isValid = true;

      try {
        // Validate Yup schema
        await schema.validate(value);
      } catch (e: any) {
        isValid = false;

        // Resolve Yup Error
        if (e.name === 'ValidationError') {
          if (e.inner != null) {
            if (e.inner.length === 0) {
              editor.setStatus(
                toValidateItemKey,
                'error',
                e.message.replace('this', toValidateItemKey)
              );
            }
            for (let err of e.inner) {
              editor.setStatus(
                toValidateItemKey,
                'error',
                err.message.replace('this', toValidateItemKey)
              );
            }
          }
        }
      }

      return isValid;
    }
  );

  return validator;
}
