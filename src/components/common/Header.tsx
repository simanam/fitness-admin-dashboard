// src/components/common/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserCircle,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BreadcrumbNavigation, { Breadcrumb } from './BreadcrumbNavigation';

interface HeaderProps {
  toggleSidebar: () => void;
  breadcrumbs: Breadcrumb[];
  showMobileMenu?: boolean;
}

const Header = ({
  toggleSidebar,
  breadcrumbs,
  showMobileMenu = true,
}: HeaderProps) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {showMobileMenu && (
              <button
                type="button"
                className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 md:hidden"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu size={24} />
              </button>
            )}

            <div className="flex-shrink-0 flex items-center">
              {/* Logo or brand could go here */}
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <BreadcrumbNavigation breadcrumbs={breadcrumbs} />
            </div>
          </div>

          <div className="flex items-center">
            {/* Notifications */}
            <div className="ml-4 relative" ref={notificationsRef}>
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">View notifications</span>
                <Bell size={20} />
              </button>

              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {/* Example notification items */}
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <UserCircle size={20} className="text-gray-400" />
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            New user registered
                          </p>
                          <p className="text-sm text-gray-500">
                            10 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <UserCircle size={20} className="text-gray-400" />
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            New exercise added
                          </p>
                          <p className="text-sm text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-2">
                    <Link
                      to="/notifications"
                      className="text-sm text-gray-700 hover:text-gray-900"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="ml-4 relative" ref={dropdownRef}>
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  id="user-menu-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <UserCircle size={24} className="text-gray-500" />
                  <span className="hidden md:flex ml-2 items-center">
                    <span className="text-sm font-medium text-gray-700 mr-1">
                      {user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </span>
                </button>
              </div>

              {dropdownOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex={-1}
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Your Profile
                  </Link>

                  <button
                    type="button"
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile breadcrumbs - shown below header on small screens */}
      <div className="sm:hidden border-t border-gray-200 px-4 py-2">
        <BreadcrumbNavigation breadcrumbs={breadcrumbs} />
      </div>
    </header>
  );
};

export default Header;
