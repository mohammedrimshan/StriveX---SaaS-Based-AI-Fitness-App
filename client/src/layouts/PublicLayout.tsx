import { Header } from '@/components/headers/Header/PublicHeader'
import { Outlet } from "react-router-dom";


export const PublicLayout= () => {
  return (
    <div className='relative'>
      <Header />
      <Outlet />
    </div>
  )
}
