import { Header } from '@/components/common/Header/PublicHeader'
import { Outlet } from "react-router-dom";


export const PublicLayout= () => {
  return (
    <div className='relative'>
      <Header />
      <Outlet />
    </div>
  )
}
