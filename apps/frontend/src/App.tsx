import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';
import { useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { initSocket } from './lib/socket';
import { toast } from 'sonner';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  // Initialize theme on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize socket and subscribe to lead events
  useEffect(() => {
    const qc = queryClient;
    const socket = initSocket();

    const onCreated = (payload: any) => {
      toast.success(`New lead: ${payload.name}`);
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['analytics-overview'] });
    };

    const onUpdated = (payload: any) => {
      toast(`Lead updated: ${payload.name}`);
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['analytics-overview'] });
    };

    socket.on('lead:created', onCreated);
    socket.on('lead:updated', onUpdated);

    return () => {
      socket.off('lead:created', onCreated);
      socket.off('lead:updated', onUpdated);
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster theme={isDarkMode ? 'dark' : 'light'} position="top-right" />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
