import { ErrorBoundary } from 'react-error-boundary';
import { Button } from './ui/Button';

const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-xl shadow-lg text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error has occurred in the application.
        </p>
        <pre className="text-left text-xs bg-muted p-4 rounded-md overflow-auto text-muted-foreground max-h-32">
          {error.message}
        </pre>
        <Button onClick={resetErrorBoundary} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
};

export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app so the error doesn't happen again
        window.location.href = '/';
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
