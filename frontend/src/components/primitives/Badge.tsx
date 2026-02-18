/**
 * Badge Component
 * Status badges with multiple variants
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-100 text-surface-700 border border-surface-200',
        primary: 'bg-primary-100 text-primary-700 border border-primary-200',
        secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
        success: 'bg-success-100 text-success-700 border border-success-200',
        warning: 'bg-warning-100 text-warning-700 border border-warning-200',
        error: 'bg-error-100 text-error-700 border border-error-200',
        info: 'bg-info-100 text-info-700 border border-info-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, size, leftIcon, rightIcon, children, ...props },
    ref
  ) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
