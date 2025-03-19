import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import ScrollUp from "./utils/ScrollUp"
import { ClientRoutes } from "./routes/ClientRoutes"
import { AdminRoutes } from "./routes/AdminRoutes"
import { TrainerRoutes } from "./routes/TrainerRoutes"
// import LoadingPage  from "./components/Loading/Loading" 


function App() {
  const [showLoading, setShowLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 6000) 
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <Router>
      {/* {showLoading && <LoadingPage />} */}
      <ScrollUp />
      <Routes>
        <Route path="/*" element={<ClientRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/trainer/*" element={<TrainerRoutes />} />
      </Routes>
    </Router>
  )
}

export default App