/**
 * Select Component
 * Custom select dropdown with proper styling
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      placeholder,
      containerClassName,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || React.useId();
    const hasError = !!error;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              hasError ? 'text-error-600' : 'text-surface-700'
            )}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            className={cn(
              // Base styles
              'flex h-11 w-full appearance-none rounded-lg border bg-white px-4 py-2.5 text-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-surface-400',
              // State styles
              hasError
                ? 'border-error-300 focus:border-error-500 focus:ring-error-100 text-error-900'
                : 'border-surface-200 focus:border-primary-500 focus:ring-primary-100 text-surface-900 hover:border-surface-300',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {hasError ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 text-sm text-error-600"
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 text-sm text-surface-500"
            >
              {helperText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
