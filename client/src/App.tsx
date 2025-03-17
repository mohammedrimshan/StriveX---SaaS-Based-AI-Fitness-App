import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ScrollUp from "./utils/ScrollUp"
import { ClientRoutes } from "./routes/ClientRoutes"
import { AdminRoutes } from "./routes/AdminRoutes"
function App() {
  return (
    <Router>
      <ScrollUp />
      <Routes>
        <Route path="/*" element={<ClientRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Router>
  )
}

export default App