/**
 * EmptyState Component
 * Display when no data is available
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/primitives/Button';
import { Package, Search, FileX, Users, Calendar, ClipboardList } from 'lucide-react';

export type EmptyStateIcon = 'default' | 'search' | 'file' | 'users' | 'calendar' | 'clipboard';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: EmptyStateIcon | React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

const iconMap: Record<EmptyStateIcon, React.ReactNode> = {
  default: <Package className="h-full w-full" />,
  search: <Search className="h-full w-full" />,
  file: <FileX className="h-full w-full" />,
  users: <Users className="h-full w-full" />,
  calendar: <Calendar className="h-full w-full" />,
  clipboard: <ClipboardList className="h-full w-full" />,
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title = 'No data found',
      description = 'There are no items to display at this time.',
      icon = 'default',
      actionLabel,
      onAction,
      className,
      compact = false,
    },
    ref
  ) => {
    // Type guard to check if icon is an EmptyStateIcon key
    const getIcon = (iconProp: EmptyStateIcon | React.ReactNode): React.ReactNode => {
      if (typeof iconProp === 'string' && iconProp in iconMap) {
        return iconMap[iconProp as EmptyStateIcon];
      }
      return iconProp;
    };
    
    const Icon = getIcon(icon);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          compact ? 'py-8 px-4' : 'py-16 px-4',
          className
        )}
      >
        <div
          className={cn(
            'rounded-full bg-surface-100 flex items-center justify-center mb-4',
            compact ? 'w-12 h-12' : 'w-16 h-16'
          )}
        >
          <div
            className={cn(
              'text-surface-400',
              compact ? 'w-6 h-6' : 'w-8 h-8'
            )}
          >
            {Icon}
          </div>
        </div>

        <h3
          className={cn(
            'font-semibold text-surface-900 mb-1',
            compact ? 'text-base' : 'text-lg'
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            'text-surface-500 max-w-sm',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {description}
        </p>

        {actionLabel && onAction && (
          <Button
            variant="primary"
            size={compact ? 'sm' : 'md'}
            className="mt-4"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
