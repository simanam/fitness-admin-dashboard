// src/components/common/Sidebar.tsx
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, UserCircle } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar = ({
  className = '',
  isMobile = false,
  onClose,
}: SidebarProps) => {
  const { navItems, currentPath, isExpanded, toggleExpand } = useNavigation();
  const { user } = useAuth();

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  // Check if a specific child path is active
  const isChildActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Fitness Admin</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <div key={item.name} className="py-0.5">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.path)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md',
                      isActive(item.path)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon && <span className="mr-3">{item.icon}</span>}
                      {item.name}
                    </div>
                    {isExpanded[item.path] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {isExpanded[item.path] && (
                    <div className="ml-6 mt-1 pl-3 border-l border-gray-200 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.path}
                          onClick={isMobile ? onClose : undefined}
                          className={cn(
                            'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                            isChildActive(child.path)
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={isMobile ? onClose : undefined}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive(item.path) && !item.children
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User profile section */}
      <div className="border-t border-gray-200 p-4">
        <Link to="/profile" className="flex items-center">
          <UserCircle size={36} className="text-gray-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.toLowerCase() || 'User'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
