import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { router } from './router';
import { ErrorBoundary } from './ErrorBoundary';
import { OnboardingModal } from '@/features/onboarding/OnboardingModal';
import { SettingsModal } from '@/features/settings/SettingsModal';
import { TrustedCircleModal } from '@/features/social/TrustedCircleModal';
import { CommunityNotesModal } from '@/features/social/CommunityNotesModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {/* Global Modals accessible across all routes */}
        <OnboardingModal />
        <SettingsModal />
        <TrustedCircleModal />
        <CommunityNotesModal />
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--color-raised)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
