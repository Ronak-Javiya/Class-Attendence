/**
 * Input Component
 * Primitive input field with label, error handling, and icons
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const hasError = !!error;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              hasError ? 'text-error-600' : 'text-surface-700',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              // Base styles
              'flex h-11 w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-all duration-200',
              'placeholder:text-surface-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-surface-400',
              // Padding adjustments for icons
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // State styles
              hasError
                ? 'border-error-300 focus:border-error-500 focus:ring-error-100 text-error-900'
                : 'border-surface-200 focus:border-primary-500 focus:ring-primary-100 text-surface-900 hover:border-surface-300',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              id={`${inputId}-error`}
              className="flex items-center gap-1.5 mt-1.5 text-sm text-error-600"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          ) : helperText ? (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id={`${inputId}-helper`}
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

Input.displayName = 'Input';

export { Input };
