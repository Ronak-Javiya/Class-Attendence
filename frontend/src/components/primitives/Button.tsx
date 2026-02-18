/**
 * Button Component
 * Primitive button with multiple variants, sizes, and states
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white shadow-elevation-1 hover:bg-primary-700 hover:-translate-y-0.5 active:translate-y-0',
        secondary:
          'bg-white text-surface-900 border border-surface-200 shadow-elevation-1 hover:bg-surface-50 hover:border-surface-300',
        tertiary:
          'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900',
        ghost:
          'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900',
        danger:
          'bg-error-600 text-white shadow-elevation-1 hover:bg-error-700 hover:-translate-y-0.5 active:translate-y-0',
        success:
          'bg-success-600 text-white shadow-elevation-1 hover:bg-success-700 hover:-translate-y-0.5 active:translate-y-0',
        outline:
          'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
        link: 'bg-transparent text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        className="inline-block"
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText || children}
            </>
          ) : (
            <>
              {leftIcon && <span className="inline-flex">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="inline-flex">{rightIcon}</span>}
            </>
          )}
        </Comp>
      </motion.div>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
