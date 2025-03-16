import { toast } from "react-hot-toast";

export function useToaster() {
	const successToast = (message: string) =>
		toast.success(message, {
			position: "top-center",
			duration: 3000,
		});

	const errorToast = (message: string) =>
		toast.error(message, {
			position: "top-center",
			duration: 3000,
		});

	const infoToast = (message: string) =>
		toast(message, {
			position: "top-center",
			duration: 3000,
			style: {
				background: "#e0f7fa",
				color: "#006064",
			},
		});

	return { successToast, errorToast, infoToast };
}
