/**
 * Card Component
 * Container component with consistent styling
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const cardVariants = cva(
  // Base styles
  'bg-white rounded-xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-surface-200 shadow-elevation-2',
        interactive: 'border-surface-200 shadow-elevation-2 cursor-pointer hover:border-primary-300 hover:shadow-elevation-3',
        outlined: 'border-surface-200 shadow-none',
        flat: 'border-transparent shadow-none bg-surface-50',
        elevated: 'border-surface-200 shadow-elevation-3',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
  animate?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant, padding, as: Component = 'div', animate = false, children, ...props },
    ref
  ) => {
    const cardContent = (
      <Component
        className={cn(cardVariants({ variant, padding }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);

Card.displayName = 'Card';

// Card Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-tight text-surface-900', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-surface-500', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end gap-3 pt-4 mt-4 border-t border-surface-100', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
