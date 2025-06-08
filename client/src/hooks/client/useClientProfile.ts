
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getClientProfile } from "@/services/client/clientService";
import { IClient } from "@/types/User";

export const useClientProfile = (clientId: string | null): UseQueryResult<IClient, Error> => {
    console.log(clientId, "useClientProfile hook called with clientId");
  return useQuery<IClient, Error>({
    queryKey: ["clientProfile", clientId],
    queryFn: async () => {
      try {
        return await getClientProfile(clientId!);
      } catch (error) {
        console.error("Client profile fetch error:", (error as Error).message);
        throw error;
      }
    },
    enabled: !!clientId,
  });
};
