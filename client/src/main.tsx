
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProviders } from './hooks/ui/Provider/AppProvider.tsx'
// Create a client

createRoot(document.getElementById("root")!).render(
	<AppProviders>
		<App />
	</AppProviders>
);
