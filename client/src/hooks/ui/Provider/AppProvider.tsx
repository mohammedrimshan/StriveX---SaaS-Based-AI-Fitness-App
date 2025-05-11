import { StrictMode,ReactNode  } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/store/store";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { SocketProvider } from "@/context/socketContext";
import { ToastContainer } from "./ToastContainer";

const queryClient = new QueryClient();

const SocketWrapper = ({ children }: { children: ReactNode }) => {
	const client = useSelector((state: RootState) => state.client.client);
	const trainer = useSelector((state: RootState) => state.trainer.trainer);
	const admin = useSelector((state: RootState) => state.admin.admin);
  
	// Determine userId and role based on who's logged in
	let userId = null;
	let role = null;
  
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
	  <SocketProvider userId={userId} role={role}>
		{children}
	  </SocketProvider>
	);
  };
  
  // This component is a special wrapper that needs access to Redux store
  const ConnectedSocketProvider = ({ children }: { children: ReactNode }) => {
	return (
	  <PersistGate loading={null} persistor={persistor}>
		<SocketWrapper>
		  {children}
		</SocketWrapper>
	  </PersistGate>
	);
  };

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<StrictMode>
			<Provider store={store}>
				<PersistGate persistor={persistor}>
					<QueryClientProvider client={queryClient}>
						<ConnectedSocketProvider>
						<ToastContainer>{children}</ToastContainer>
						</ConnectedSocketProvider>
					</QueryClientProvider>
				</PersistGate>
			</Provider>
		</StrictMode>
	);
}
