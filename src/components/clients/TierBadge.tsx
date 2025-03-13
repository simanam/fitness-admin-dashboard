// src/components/clients/TierBadge.tsx
import React from 'react';
import { cn } from '../../lib/utils';
import { Zap, Crown, Star, CircleDollarSign } from 'lucide-react';

interface TierBadgeProps {
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  className,
  size = 'md',
}) => {
  const tierConfig = {
    free: {
      label: 'Free',
      icon: CircleDollarSign,
      color: 'bg-gray-100 text-gray-800',
    },
    basic: {
      label: 'Basic',
      icon: Star,
      color: 'bg-blue-100 text-blue-800',
    },
    premium: {
      label: 'Premium',
      icon: Zap,
      color: 'bg-purple-100 text-purple-800',
    },
    enterprise: {
      label: 'Enterprise',
      icon: Crown,
      color: 'bg-amber-100 text-amber-800',
    },
  };

  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      {config.label}
    </span>
  );
};

export default TierBadge;
