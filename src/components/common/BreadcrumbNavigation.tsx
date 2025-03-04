// src/components/common/BreadcrumbNavigation.tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  name: string;
  path: string;
}

interface BreadcrumbNavigationProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

const BreadcrumbNavigation = ({
  breadcrumbs,
  className = '',
}: BreadcrumbNavigationProps) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={16} className="mx-1 text-gray-400" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-600 font-medium">{crumb.name}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-gray-500 hover:text-gray-700 hover:underline"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;
