// src/components/exercises/form/FormField.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required,
  helperText,
  className,
  children,
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {error ? (
        <div className="flex items-center mt-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormField;
