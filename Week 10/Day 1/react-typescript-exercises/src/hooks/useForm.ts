import { useState, type ChangeEvent, type FormEvent } from "react";

export type FormErrors<T extends { [Key in keyof T]: string }> = Partial<
  Record<keyof T, string>
>;

export type FormValidators<T extends { [Key in keyof T]: string }> = Partial<{
  [Key in keyof T]: (value: T[Key], values: T) => string | undefined;
}>;

interface UseFormOptions<T extends { [Key in keyof T]: string }> {
  initialValues: T;
  validators: FormValidators<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

function useForm<T extends { [Key in keyof T]: string }>({
  initialValues,
  validators,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  function validate(valuesToValidate: T): FormErrors<T> {
    const nextErrors: FormErrors<T> = {};

    for (const key of Object.keys(validators) as (keyof T)[]) {
      const validator = validators[key];
      const error = validator?.(valuesToValidate[key], valuesToValidate);
      if (error) {
        nextErrors[key] = error;
      }
    }

    return nextErrors;
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.currentTarget;
    if (!Object.hasOwn(values, name)) {
      return;
    }

    const key = name as keyof T;
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      await onSubmit(values);
    }
  }

  return { values, errors, handleChange, handleSubmit };
}

export default useForm;
