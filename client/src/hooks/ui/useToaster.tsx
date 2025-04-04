// src/hooks/ui/useToaster.ts
import { toast, Toast } from "react-hot-toast";
import { CustomToast } from "./CustomToast";
import { useCallback } from "react";

export function useToaster() {
  const createSuccessToast = useCallback((t: Toast, message: string) => (
    <CustomToast message={message} type="success" toastId={t.id} />
  ), []);

  const successToast = useCallback((message: string) =>
    toast.custom((t: Toast) => createSuccessToast(t, message), {
      position: "top-right",
      duration: 3000,
    }), [createSuccessToast]);

  const createErrorToast = useCallback((t: Toast, message: string) => (
    <CustomToast message={message} type="error" toastId={t.id} />
  ), []);

  const errorToast = useCallback((message: string) =>
    toast.custom((t: Toast) => createErrorToast(t, message), {
      position: "top-right",
      duration: 3000,
    }), [createErrorToast]);

  const createInfoToast = useCallback((t: Toast, message: string) => (
    <CustomToast message={message} type="info" toastId={t.id} />
  ), []);

  const infoToast = useCallback((message: string) =>
    toast.custom((t: Toast) => createInfoToast(t, message), {
      position: "top-right",
      duration: 3000,
    }), [createInfoToast]);

  return { successToast, errorToast, infoToast };
}