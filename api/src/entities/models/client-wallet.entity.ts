export interface IClientWalletEntity {
  id?: string;
  clientId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}