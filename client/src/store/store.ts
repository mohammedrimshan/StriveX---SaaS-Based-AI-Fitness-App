import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import clientReducer from "./slices/client.slice";
import trainerReducer from "./slices/trainer.slice";
import adminReducer from "./slices/admin.slice";
import workoutProgressReducer from "./slices/workoutProgress.slice";

// Root persistence config
const rootPersistConfig = {
  key: "session",
  storage,
  whitelist: ["client", "trainer", "admin", "workoutProgress"],
};

// Combine reducers
const rootReducer = combineReducers({
  client: clientReducer,
  trainer: trainerReducer,
  admin: adminReducer,
  workoutProgress: workoutProgressReducer,
});

// Apply persistence to the root reducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;