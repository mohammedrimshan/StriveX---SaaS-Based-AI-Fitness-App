import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollUp from "./utils/ScrollUp";
import FallbackUI from "./components/common/FallBackUi";

// Lazy-loaded route components
const ClientRoutes = lazy(() => import("@/routes/ClientRoutes"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"));
const TrainerRoutes = lazy(() => import("./routes/TrainerRoutes"));
const NotFoundPage = lazy(() => import("./components/common/NotFoundPage"));

function App() {
  return (
    <Router>
      <ScrollUp />
      <Suspense fallback={<FallbackUI />}>
        <Routes>
          <Route path="/*" element={<ClientRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/trainer/*" element={<TrainerRoutes />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;