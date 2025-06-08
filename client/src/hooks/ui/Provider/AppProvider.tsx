// src/AppProviders.tsx
import { StrictMode, ReactNode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Provider,shallowEqual } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '@/store/store';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { SocketProvider } from '@/context/socketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastContainer } from './ToastContainer';
import { UserRole } from '@/types/UserRole';

const queryClient = new QueryClient();

const CombinedProviders = ({ children }: { children: ReactNode }) => {
  const { client, trainer, admin } = useSelector(
    (state: RootState) => ({
      client: state.client.client,
      trainer: state.trainer.trainer,
      admin: state.admin.admin,
    }),
    shallowEqual
  );

  let userId: string | null = null;
  let role: UserRole | null = null;

  if (client && client.role === 'client') {
    userId = client.id;
    role = client.role;
  } else if (trainer && trainer.role === 'trainer') {
    userId = trainer.id;
    role = trainer.role;
  } else if (admin && admin.role === 'admin') {
    userId = admin.id;
    role = admin.role;
  }

  return (
    <SocketProvider userId={userId} role={role} currentUser={userId ? { id: userId, role: role || '' } : null}>
      <NotificationProvider userId={userId} role={role}>
        {children}
      </NotificationProvider>
    </SocketProvider>
  );
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <CombinedProviders>
              <ToastContainer>{children}</ToastContainer>
            </CombinedProviders>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </StrictMode>
  );
}