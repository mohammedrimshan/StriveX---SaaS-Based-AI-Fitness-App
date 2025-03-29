// src/hooks/ui/useToaster.ts
import { toast, Toast } from "react-hot-toast";
import { CustomToast } from "./CustomToast";

export function useToaster() {
  const createSuccessToast = (t: Toast, message: string) => (
    <CustomToast message={message} type="success" toastId={t.id} />
  );

  const successToast = (message: string) =>
    toast.custom((t: Toast) => createSuccessToast(t, message), {
      position: "top-right",
      duration: 3000,
    });

  const createErrorToast = (t: Toast, message: string) => (
    <CustomToast message={message} type="error" toastId={t.id} />
  );

  const errorToast = (message: string) =>
    toast.custom((t: Toast) => createErrorToast(t, message), {
      position: "top-right",
      duration: 3000,
    });

  const createInfoToast = (t: Toast, message: string) => (
    <CustomToast message={message} type="info" toastId={t.id} />
  );

  const infoToast = (message: string) =>
    toast.custom((t: Toast) => createInfoToast(t, message), {
      position: "top-right",
      duration: 3000,
    });

  return { successToast, errorToast, infoToast };
}