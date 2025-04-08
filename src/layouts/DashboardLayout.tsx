// src/layouts/DashboardLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Home,
  Dumbbell,
  UserCircle,
  ChevronDown,
  ChevronRight,
  Layers,
  Box,
  Users,
  Database,
  Bone,
  FileText,
  Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSessionTimer } from '../hooks/useSessionTimer';

function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  // Initialize session timer to handle inactivity
  useSessionTimer();

  // Navigation items definition with children for nested navigation
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    {
      name: 'Exercises',
      path: '/exercises',
      icon: <Dumbbell size={20} />,
      children: [
        { name: 'All Exercises', path: '/exercises' },
        { name: 'Add New', path: '/exercises/new' },
      ],
    },
    {
      name: 'Muscles',
      path: '/muscles',
      icon: <Layers size={20} />,
      children: [
        { name: 'All Muscles', path: '/muscles' },
        { name: 'Muscle Groups', path: '/muscles/groups' },
      ],
    },
    {
      name: 'Equipment',
      path: '/equipment',
      icon: <Box size={20} />,
      children: [
        { name: 'All Equipment', path: '/equipment' },
        { name: 'Add New', path: '/equipment/new' },
      ],
    },
    {
      name: 'Joints',
      path: '/joints',
      icon: <Bone size={20} />,
      children: [
        { name: 'All Joints', path: '/joints' },
        { name: 'Add New', path: '/joints/new' },
      ],
    },
    {
      name: 'Movement Patterns',
      path: '/movement-patterns',
      icon: <Activity size={20} />,
      children: [
        { name: 'All Patterns', path: '/movement-patterns' },
        { name: 'Add New', path: '/movement-patterns/new' },
      ],
    },
    { name: 'Admin Users', path: '/users', icon: <Users size={20} /> },
    { name: 'API Clients', path: '/clients', icon: <Database size={20} /> },
  ];

  // Auto-expand items based on the current path
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children && location.pathname.startsWith(item.path)) {
        setExpandedItems((prev) => ({ ...prev, [item.path]: true }));
      }
    });
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Item is active if current path starts with item path
  // Exception for root path which should be exact match
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Toggle expansion of navigation items with children
  const toggleExpand = (path) => {
    setExpandedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Handle logout action
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ name: 'Dashboard', path: '/' }];

    const breadcrumbs = [{ name: 'Dashboard', path: '/' }];
    let currentPath = '';

    paths.forEach((path) => {
      currentPath += `/${path}`;

      // Find matching nav item to get proper name
      const foundItem = navItems.find(
        (item) =>
          item.path === currentPath ||
          (item.children &&
            item.children.some((child) => child.path === currentPath))
      );

      if (foundItem) {
        const childItem =
          foundItem.children &&
          foundItem.children.find((child) => child.path === currentPath);

        breadcrumbs.push({
          name: childItem ? childItem.name : foundItem.name,
          path: currentPath,
        });
      } else {
        // Use capitalized path part if no match
        breadcrumbs.push({
          name: path.charAt(0).toUpperCase() + path.slice(1),
          path: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-black">Fitness Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="h-full overflow-y-auto">
          <nav className="mt-4 px-2 space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
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
                        <span className="mr-3 text-gray-500">{item.icon}</span>
                        {item.name}
                      </div>
                      {expandedItems[item.path] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    {expandedItems[item.path] && (
                      <div className="ml-7 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.path}
                            className={cn(
                              'block px-3 py-2 text-sm font-medium rounded-md',
                              location.pathname === child.path
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                      isActive(item.path)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span className="mr-3 text-gray-500">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {user && (
            <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <UserCircle size={36} className="text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase() || 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col border-r border-gray-200 bg-white">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-black">Fitness Admin</h1>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="mt-6 px-3 flex-1 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <>
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
                          <span className="mr-3 text-gray-500">
                            {item.icon}
                          </span>
                          {item.name}
                        </div>
                        {expandedItems[item.path] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {expandedItems[item.path] && (
                        <div className="ml-7 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.path}
                              className={cn(
                                'block px-3 py-2 text-sm font-medium rounded-md',
                                location.pathname === child.path
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                        isActive(item.path)
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <span className="mr-3 text-gray-500">{item.icon}</span>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {user && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <UserCircle size={36} className="text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase() || 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Breadcrumbs - visible on all screen sizes */}
            <div className="hidden md:flex items-center">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.path} className="flex items-center">
                      {index > 0 && (
                        <ChevronRight
                          size={16}
                          className="mx-1 text-gray-400"
                        />
                      )}
                      {index === breadcrumbs.length - 1 ? (
                        <span className="text-gray-600 font-medium">
                          {crumb.name}
                        </span>
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
            </div>

            {/* User dropdown */}
            <div className="relative ml-auto">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <UserCircle size={24} className="text-gray-500" />
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {user?.email}
                </span>
                <ChevronDown size={16} className="ml-1" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile breadcrumbs */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 overflow-x-auto">
              {breadcrumbs.map((crumb, index) => (
                <li
                  key={crumb.path}
                  className="flex items-center whitespace-nowrap"
                >
                  {index > 0 && (
                    <ChevronRight
                      size={16}
                      className="mx-1 text-gray-400 flex-shrink-0"
                    />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-600 font-medium text-sm">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-gray-500 hover:text-gray-700 hover:underline text-sm"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
