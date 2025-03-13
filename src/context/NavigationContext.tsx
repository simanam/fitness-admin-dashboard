// src/context/NavigationContext.tsx
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Dumbbell, Layers, Box, Users, Database } from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
  children?: Array<{
    name: string;
    path: string;
  }>;
}

interface NavigationContextType {
  navItems: NavItem[];
  currentPath: string;
  isExpanded: Record<string, boolean>;
  toggleExpand: (path: string) => void;
  activePath: string | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const [activePath, setActivePath] = useState<string | null>(null);

  // Define navigation items
  const navItems: NavItem[] = [
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
      name: 'Admin Users',
      path: '/users',
      icon: <Users size={20} />,
      children: [
        { name: 'All Users', path: '/users' },
        { name: 'Add New', path: '/users/new' },
      ],
    },
    {
      name: 'API Clients',
      path: '/clients',
      icon: <Database size={20} />,
      children: [
        { name: 'All Clients', path: '/clients' },
        { name: 'Add New', path: '/clients/new' },
      ],
    },
  ];

  // Update current path when location changes
  useEffect(() => {
    setCurrentPath(location.pathname);

    // Find active path
    let found = false;
    for (const item of navItems) {
      // Check if the current path matches a nav item
      if (location.pathname === item.path) {
        setActivePath(item.path);
        found = true;
        break;
      }

      // Check if the current path starts with a nav item path (except root)
      if (item.path !== '/' && location.pathname.startsWith(item.path)) {
        setActivePath(item.path);
        setIsExpanded((prev) => ({ ...prev, [item.path]: true }));
        found = true;
        break;
      }

      // Check if the current path matches a child path
      if (item.children) {
        for (const child of item.children) {
          if (location.pathname === child.path) {
            setActivePath(item.path);
            setIsExpanded((prev) => ({ ...prev, [item.path]: true }));
            found = true;
            break;
          }
        }
      }

      if (found) break;
    }

    // Default to home if no match found
    if (!found) {
      setActivePath('/');
    }
  }, [location.pathname]);

  const toggleExpand = (path: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  return (
    <NavigationContext.Provider
      value={{
        navItems,
        currentPath,
        isExpanded,
        toggleExpand,
        activePath,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
