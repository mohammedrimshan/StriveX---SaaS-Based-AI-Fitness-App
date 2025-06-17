import Community from "@/components/Community/index.tsx";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export default function CommunityForum() {
  const userId = useSelector((state: RootState) => state.client.client?.id) || '';

  if(!userId){
    <h1>Need user Id</h1>
  }
  return (
    <div>
      <Community userId={userId}/>
    </div>
  )
}
