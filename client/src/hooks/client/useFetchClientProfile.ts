// src/services/client/useFetchClientProfile.ts
import { useQuery } from "@tanstack/react-query"; 
import { clientAxiosInstance } from "@/api/client.axios"; 
import {Client} from '@/store//slices/client.slice'
export const useFetchClientProfile = (clientId: string | undefined) => {
  return useQuery<Client>({
    queryKey: ["clientProfile", clientId],
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID is required");
      const response = await clientAxiosInstance.get(`/clients/${clientId}`);
      return response.data;
    },
    enabled: !!clientId, 
  });
};