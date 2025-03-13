// src/components/clients/TierDropdown.tsx
import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  CircleDollarSign,
  Star,
  Zap,
  Crown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ConfirmationDialog from '../ui/confirmation-dialog';
import { CLIENT_TIERS } from '../../types/clientFormTypes';

interface TierDropdownProps {
  clientId: string;
  currentTier: 'free' | 'basic' | 'premium' | 'enterprise';
  onTierChange: (tier: string) => Promise<boolean>;
  disabled?: boolean;
}

const TierDropdown: React.FC<TierDropdownProps> = ({
  clientId,
  currentTier,
  onTierChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

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

  const currentTierObj = tierConfig[currentTier];
  const CurrentTierIcon = currentTierObj.icon;

  const handleTierClick = (tier: string) => {
    if (tier === currentTier) {
      setIsOpen(false);
      return;
    }

    setSelectedTier(tier);
    setShowConfirmDialog(true);
    setIsOpen(false);
  };

  const handleConfirmTierChange = async () => {
    if (!selectedTier) return;

    setIsSubmitting(true);
    try {
      const success = await onTierChange(selectedTier);
      if (success) {
        setShowConfirmDialog(false);
        setSelectedTier(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedTierDetails = () => {
    if (!selectedTier) return null;
    return CLIENT_TIERS.find((tier) => tier.value === selectedTier);
  };

  const selectedTierDetails = getSelectedTierDetails();

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          type="button"
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium',
            currentTierObj.color,
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <CurrentTierIcon className="mr-1 h-4 w-4" />
          {currentTierObj.label}
          <ChevronDown
            className={cn(
              'ml-1 h-4 w-4 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-1 w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {Object.entries(tierConfig).map(([tier, config]) => {
                const TierIcon = config.icon;
                return (
                  <button
                    key={tier}
                    onClick={() => handleTierClick(tier)}
                    className={cn(
                      'w-full block px-4 py-2 text-sm text-left',
                      tier === currentTier
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    role="menuitem"
                    disabled={isSubmitting}
                  >
                    <span className="flex items-center">
                      {tier === currentTier ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <TierIcon className="mr-2 h-4 w-4" />
                      )}
                      <span>{config.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setSelectedTier(null);
        }}
        onConfirm={handleConfirmTierChange}
        title="Change Client Tier"
        message={
          selectedTierDetails ? (
            <div>
              <p className="mb-4">
                Are you sure you want to change this client's tier from{' '}
                <strong>{currentTierObj.label}</strong> to{' '}
                <strong>{selectedTierDetails.label}</strong>?
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">
                  New Tier Details:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Monthly quota:</span>{' '}
                    {selectedTierDetails.quota.toLocaleString()} requests
                  </li>
                  <li>
                    <span className="font-medium">Rate limit:</span>{' '}
                    {selectedTierDetails.rateLimit} requests/minute
                  </li>
                  <li>
                    <span className="font-medium">Description:</span>{' '}
                    {selectedTierDetails.description}
                  </li>
                </ul>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                This change will take effect immediately. The client will be
                notified of this change.
              </p>
            </div>
          ) : (
            <p>Are you sure you want to change this client's tier?</p>
          )
        }
        confirmText="Change Tier"
        type="info"
        isLoading={isSubmitting}
      />
    </>
  );
};

export default TierDropdown;
