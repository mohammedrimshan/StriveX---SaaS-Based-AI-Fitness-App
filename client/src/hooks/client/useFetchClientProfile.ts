// src/services/client/useFetchClientProfile.ts
import { useQuery } from "@tanstack/react-query"; 
import {Client} from '@/store//slices/client.slice'
import { axiosInstance } from "@/api/private.axios";
export const useFetchClientProfile = (clientId: string | undefined) => {
  return useQuery<Client>({
    queryKey: ["clientProfile", clientId],
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID is required");
      const response = await axiosInstance.get(`/clients/${clientId}`);
      return response.data;
    },
    enabled: !!clientId, 
  });
};