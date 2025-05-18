// frontend/src/store/selectors/userSelectors.ts
import { RootState } from './store';

 interface User {
  id: string;
  role:string;
  name?: string;
  avatarUrl?: string;
  preferredWorkout?: string;      
  isTrainer?: boolean;
  specialization?:string;
}

export const selectCurrentUser = (state: RootState): User | null => {
  const client = state.client.client;
  console.log(client,"client")
  const trainer = state.trainer.trainer;
  const admin = state.admin.admin;

  if (client && client.role === 'client') {
    return {
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      role:client.role,
      avatarUrl: client.profileImage || '',
      isTrainer: false,
      preferredWorkout: client.preferredWorkout || 'General',
    };
  } else if (trainer && trainer.role === 'trainer') {
    return {
      id: trainer.id,
      name: `${trainer.firstName} ${trainer.lastName}`,
      role:trainer.role,
      avatarUrl: trainer.profileImage || '',
      isTrainer: true,
      specialization: trainer.specialization?.join(', ') || 'General',
    };
  } else if (admin && admin.role === 'admin') {
    return {
      id: admin.id,
      name: `${admin.firstName} ${admin.lastName}`,
      role:admin.role,
      avatarUrl: admin.profileImage || '',
      isTrainer: false,
      preferredWorkout: 'General',
    };
  }
  return null;
};


export const selectUserId = (state: RootState): string | null => {
  const client = state.client.client;
  console.log(client?.preferredWorkout)

  const trainer = state.trainer.trainer;
  const admin = state.admin.admin;

  if (client && client.role === 'client') {
    return client.id;
  } else if (trainer && trainer.role === 'trainer') {
    return trainer.id;
  } else if (admin && admin.role === 'admin') {
    return admin.id;
  }
  return null;
};