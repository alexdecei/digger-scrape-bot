import { ReactNode } from 'react';

interface ConfigurationItemProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const ConfigurationItem = ({ label, description, children }: ConfigurationItemProps) => {
  return (
    <div className="mb-6">
      <div className="mb-2">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

export default ConfigurationItem;
