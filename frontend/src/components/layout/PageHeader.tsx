/**
 * PageHeader Component
 * Consistent page header with title, description, and actions
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, className, children }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-surface-500">{description}</p>
          )}
          {children}
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </motion.div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export { PageHeader };
