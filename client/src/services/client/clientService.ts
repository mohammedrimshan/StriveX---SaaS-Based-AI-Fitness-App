import { clientAxiosInstance} from "@/api/client.axios";
import { IAuthResponse } from "@/types/Response";
import { IClient } from "@/types/User";
import { IAxiosResponse } from "@/types/Response";
import { UpdatePasswordData } from "@/hooks/client/useClientPasswordChange";

export const updateClientProfile = async (profileData: Partial<IClient>): Promise<IAuthResponse> => {
  const response = await clientAxiosInstance.put(`/client/${profileData.id}/profile`, profileData)
  console.log(response.data)
  return response.data
}

export const updateClientPassword = async ({
  currentPassword,
  newPassword,
}: UpdatePasswordData) => {
  const response = await clientAxiosInstance.put<IAxiosResponse>(
    "/client/update-password",
    {
      currentPassword,
      newPassword,
    }
  );
  console.log(response.data)
  return response.data;
};
