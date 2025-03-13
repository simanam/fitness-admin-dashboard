// src/components/ui/radio-group.tsx
import * as React from 'react';
import { cn } from '../../lib/utils';

// Create a context to share the radio group state
interface RadioGroupContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = React.createContext<
  RadioGroupContextType | undefined
>(undefined);

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn('flex flex-col gap-2', className)}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  className?: string;
}

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className, id, value, ...props }, ref) => {
  const radioGroupContext = React.useContext(RadioGroupContext);

  if (!radioGroupContext) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const { value: groupValue, onValueChange } = radioGroupContext;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onValueChange(value);
    }
  };

  return (
    <input
      type="radio"
      id={id}
      ref={ref}
      value={value}
      className={cn(
        'h-4 w-4 rounded-full border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
        className
      )}
      checked={groupValue === value}
      onChange={handleChange}
      {...props}
    />
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';
