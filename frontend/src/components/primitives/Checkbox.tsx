/**
 * Checkbox Component
 * Accessible checkbox with label
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  indeterminate?: boolean;
  containerClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      helperText,
      indeterminate = false,
      containerClassName,
      disabled,
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || React.useId();
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className={cn('flex items-start gap-3', containerClassName)}>
        <div className="relative flex items-center">
          <input
            id={checkboxId}
            type="checkbox"
            className="peer sr-only"
            ref={checkboxRef}
            disabled={disabled}
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              // Base styles
              'h-5 w-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
              'peer-focus:ring-2 peer-focus:ring-primary-100 peer-focus:ring-offset-0',
              // Unchecked state
              !checked && !indeterminate && [
                'border-surface-300 bg-white',
                'hover:border-surface-400',
                'peer-focus:border-primary-500',
              ],
              // Checked/Indeterminate state
              (checked || indeterminate) && [
                'border-primary-600 bg-primary-600',
                'peer-focus:ring-primary-100',
              ],
              // Disabled state
              disabled && [
                'cursor-not-allowed',
                !checked && !indeterminate && 'border-surface-200 bg-surface-100',
                (checked || indeterminate) && 'bg-surface-300 border-surface-300',
              ],
              className
            )}
          >
            {checked && !indeterminate && (
              <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
            )}
            {indeterminate && (
              <Minus className="h-3.5 w-3.5 text-white stroke-[3]" />
            )}
          </div>
        </div>

        {(label || helperText) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium select-none cursor-pointer',
                  disabled ? 'text-surface-400' : 'text-surface-700'
                )}
              >
                {label}
              </label>
            )}
            {helperText && (
              <p className="text-sm text-surface-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
