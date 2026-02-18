/**
 * StatCard Component
 * Display statistics with icon and trend indicator
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/primitives/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors } from '@/design-system';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  trendLabel?: string;
  className?: string;
  animate?: boolean;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      subtitle,
      icon,
      iconBgColor = colors.primary[100],
      iconColor = colors.primary[600],
      trend,
      trendValue,
      trendLabel,
      className,
      animate = true,
    },
    ref
  ) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor =
      trend === 'up'
        ? 'text-success-600'
        : trend === 'down'
        ? 'text-error-600'
        : 'text-surface-400';

    const cardContent = (
      <Card
        ref={ref}
        variant="default"
        padding="md"
        className={cn('h-full', className)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-surface-900 tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-surface-500 mt-1">{subtitle}</p>
            )}

            {trend && (
              <div className="flex items-center gap-1.5 mt-3">
                <TrendIcon className={cn('h-4 w-4', trendColor)} />
                {trendValue && (
                  <span className={cn('text-sm font-medium', trendColor)}>
                    {trendValue}
                  </span>
                )}
                {trendLabel && (
                  <span className="text-sm text-surface-400">{trendLabel}</span>
                )}
              </div>
            )}
          </div>

          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: iconBgColor }}
          >
            <div style={{ color: iconColor }}>{icon}</div>
          </div>
        </div>
      </Card>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-full"
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };
