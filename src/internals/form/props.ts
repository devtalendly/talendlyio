import type { AnyFieldApi } from '@tanstack/react-form';

export function isInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}

export function getFieldId(field: AnyFieldApi) {
  return `${field.form.formId}-${field.name}`;
}

export function getFieldErrorId(field: AnyFieldApi) {
  return `${getFieldId(field)}-error`;
}

export function getFieldDescriptionId(field: AnyFieldApi) {
  return `${getFieldId(field)}-description`;
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<T, K>;
}

type GenericFieldProps = {
  id: string;
  name: string;
  'aria-invalid': boolean;
  'aria-describedby': string;
};

type InputFieldProps = GenericFieldProps & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
};

export function getInputProps<
  TField extends AnyFieldApi,
  Key extends keyof InputFieldProps,
>(field: TField, keys?: Key[]): Pick<InputFieldProps, Key> {
  const props = {
    id: getFieldId(field),
    name: field.name,
    value: field.state.value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      field.handleChange(e.target.value),
    onBlur: field.handleBlur,
    'aria-invalid': isInvalid(field),
    'aria-describedby': !isInvalid(field)
      ? getFieldDescriptionId(field)
      : `${getFieldDescriptionId(field)} ${getFieldErrorId(field)}`,
  };

  return keys ? pick(props, keys) : props;
}

type TextareaFieldProps = GenericFieldProps & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
};

export function getTextareaProps<
  TField extends AnyFieldApi,
  Key extends keyof TextareaFieldProps,
>(field: TField, keys?: Key[]): Pick<TextareaFieldProps, Key> {
  const props = {
    id: getFieldId(field),
    name: field.name,
    value: field.state.value,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      field.handleChange(e.target.value),
    onBlur: field.handleBlur,
    'aria-invalid': isInvalid(field),
    'aria-describedby': !isInvalid(field)
      ? getFieldDescriptionId(field)
      : `${getFieldDescriptionId(field)} ${getFieldErrorId(field)}`,
  };

  return keys ? pick(props, keys) : props;
}

type SelectFieldProps = GenericFieldProps & {
  value: string;
  onChange: AnyFieldApi['handleChange'];
};

export function getSelectProps<
  TField extends AnyFieldApi,
  Key extends keyof SelectFieldProps,
>(field: TField, keys?: Key[]): Pick<SelectFieldProps, Key> {
  const props = {
    id: getFieldId(field),
    name: field.name,
    value: field.state.value,
    onChange: field.handleChange,
    'aria-invalid': isInvalid(field),
    'aria-describedby': !isInvalid(field)
      ? getFieldDescriptionId(field)
      : `${getFieldDescriptionId(field)} ${getFieldErrorId(field)}`,
  };

  return keys ? pick(props, keys) : props;
}

type CheckboxFieldProps = GenericFieldProps & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function getCheckboxProps<
  TField extends AnyFieldApi,
  Key extends keyof CheckboxFieldProps,
>(field: TField, keys?: Key[]): Pick<CheckboxFieldProps, Key> {
  const props = {
    id: getFieldId(field),
    name: field.name,
    checked: field.state.value,
    onCheckedChange: (checked: boolean) => field.handleChange(checked),
    'aria-invalid': isInvalid(field),
    'aria-describedby': !isInvalid(field)
      ? getFieldDescriptionId(field)
      : `${getFieldDescriptionId(field)} ${getFieldErrorId(field)}`,
  };

  return keys ? pick(props, keys) : props;
}

type RadioFieldProps = GenericFieldProps & {
  value: string;
  onChange: AnyFieldApi['handleChange'];
};

export function getRadioProps<
  TField extends AnyFieldApi,
  Key extends keyof RadioFieldProps,
>(field: TField, keys?: Key[]): Pick<RadioFieldProps, Key> {
  const props = {
    id: getFieldId(field),
    name: field.name,
    value: field.state.value,
    onChange: field.handleChange,
    'aria-invalid': isInvalid(field),
    'aria-describedby': !isInvalid(field)
      ? getFieldDescriptionId(field)
      : `${getFieldDescriptionId(field)} ${getFieldErrorId(field)}`,
  };

  return keys ? pick(props, keys) : props;
}

export function getFieldsetProps<TField extends AnyFieldApi>(field: TField) {
  return {
    'aria-invalid': isInvalid(field),
    'aria-describedby': !isInvalid(field)
      ? getFieldDescriptionId(field)
      : `${getFieldDescriptionId(field)} ${getFieldErrorId(field)}`,
  };
}
