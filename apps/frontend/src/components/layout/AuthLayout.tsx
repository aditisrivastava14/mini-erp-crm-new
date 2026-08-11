import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';

export const AuthLayout = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 inline-block">
          GigFlow CRM
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
