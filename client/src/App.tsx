import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ClientRoutes } from "./routes/ClientRoutes"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<ClientRoutes />} />
      </Routes>
    </Router>
  )
}

export default App