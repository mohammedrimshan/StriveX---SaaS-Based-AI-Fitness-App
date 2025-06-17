import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ScrollUp from "./utils/ScrollUp"
import { ClientRoutes } from "./routes/ClientRoutes"
import { AdminRoutes } from "./routes/AdminRoutes"
import { TrainerRoutes } from "./routes/TrainerRoutes"
import NotFoundPage from "./components/common/NotFoundPage"

function App() {

  
  
  return (
    <Router>
      <ScrollUp />
      <Routes>
        <Route path="/*" element={<ClientRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/trainer/*" element={<TrainerRoutes />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App