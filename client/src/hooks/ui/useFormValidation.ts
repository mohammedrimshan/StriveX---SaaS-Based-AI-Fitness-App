import { useState, useEffect } from 'react';
import * as Yup from 'yup';

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: Yup.Schema,
  data: T,
  validateOnChange = false
) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateForm = async (): Promise<boolean> => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      setIsValid(true);
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: ValidationErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
        setIsValid(false);
      }
      return false;
    }
  };

  // Validate a single field
  const validateField = async (fieldName: string, value: any): Promise<boolean> => {
    try {
      // Get the specific field schema
      const fieldSchema = Yup.reach(schema, fieldName) as Yup.Schema;
      await fieldSchema.validate(value);
      
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: err.message,
        }));
      }
      return false;
    }
  };

  useEffect(() => {
    if (validateOnChange) {
      validateForm();
    }
  }, [data]);

  return { errors, isValid, validateForm, validateField };
}