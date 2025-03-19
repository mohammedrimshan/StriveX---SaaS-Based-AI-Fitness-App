import { PublicLayout } from '@/layouts/PublicLayout'
import {Route, Routes} from "react-router-dom"

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}> 
      </Route>
    </Routes>
  )
}
