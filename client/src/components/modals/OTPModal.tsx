import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dumbbell, Timer, CheckCircle, SendHorizonal } from "lucide-react";

interface OTPModalProps {
	isOpen: boolean;
	onClose: () => void;
	onVerify: (otp: string) => void;
	onResend: () => void;
	isSending: boolean;
}

export default function OTPModal({
	isOpen,
	onClose,
	onVerify,
	onResend,
	isSending,
}: OTPModalProps) {
	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [timer, setTimer] = useState(30);
	const [isTimerRunning, setIsTimerRunning] = useState(false);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isTimerRunning && timer > 0) {
			interval = setInterval(() => {
				setTimer((prevTimer) => prevTimer - 1);
			}, 1000);
		} else if (timer === 0) {
			setIsTimerRunning(false);
		}
		return () => clearInterval(interval);
	}, [isTimerRunning, timer]);

	useEffect(() => {
		if (isOpen) {
			setTimer(30);
			setIsTimerRunning(true);
		}
	}, [isOpen]);

	const handleVerify = () => {
		setIsVerifying(true);
		onVerify(otp);
		setTimeout(() => {
			setIsVerifying(false);
		}, 500);
	};

	const handleResend = () => {
		onResend();
		setTimer(30);
		setIsTimerRunning(true);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md z-50 bg-white border-violet-200 shadow-lg">
				<DialogHeader>
					<div className="flex items-center justify-center mb-2">
						<Dumbbell className="h-8 w-8 text-violet-600 mr-2" />
						<DialogTitle className="text-2xl font-bold text-center text-violet-800">
							Verification Code
						</DialogTitle>
					</div>
					<DialogDescription className="text-center">
						We have sent a verification code to your email. Please
						enter the code below.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-6 py-4">
					<div className="relative">
						<InputOTP maxLength={4} value={otp} onChange={setOtp}>
							<InputOTPGroup className="gap-2">
								{[...Array(4)].map((_, index) => (
									<InputOTPSlot
										key={index}
										index={index}
										className="w-11 h-11 text-center text-xl bg-white border-2 border-violet-300 rounded-lg focus:outline-none focus:border-violet-500"
									/>
								))}
							</InputOTPGroup>
						</InputOTP>
						<div className="absolute -top-3 -right-3">
							<Timer className="h-5 w-5 text-violet-500" />
						</div>
					</div>

					<div className="text-sm text-center flex items-center justify-center">
						<span className="mr-1">Didn't receive the code?</span>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={handleResend}
										disabled={isSending || isTimerRunning}
										className="text-violet-600 font-medium disabled:opacity-50 flex items-center">
										{isSending ? (
											<>
												Sending...
												<SendHorizonal className="h-4 w-4 ml-1 animate-pulse" />
											</>
										) : (
											<>
												Resend
												<SendHorizonal className="h-4 w-4 ml-1" />
											</>
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent
									className="bg-violet-100 text-violet-800 border border-violet-200 data-[side=top]:before:hidden data-[side=bottom]:before:hidden data-[side=left]:before:hidden data-[side=right]:before:hidden"
									side="bottom">
									{isTimerRunning ? (
										<div className="flex items-center">
											<Timer className="h-4 w-4 mr-1 animate-pulse" />
											Resend in {timer}s
										</div>
									) : (
										"Click to resend"
									)}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>

					<Button
						onClick={handleVerify}
						disabled={otp.length !== 4 || isVerifying}						
						className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center justify-center gap-2 transition-all duration-200">
						{isVerifying ? (
							<>
								Verifying...
								<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
							</>
						) : (
							<>
								Verify
								<CheckCircle className="h-5 w-5" />
							</>
						)}
					</Button>
				</div>

				<div className="flex justify-center mt-2">
					<div className="flex items-center text-xs text-violet-500">
						<Dumbbell className="h-4 w-4 mr-1" />
						Get ready for your fitness journey!
					</div>
				</div>
			</DialogContent>

			{/* Dark overlay behind the modal */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
					aria-hidden="true"
				/>
			)}
		</Dialog>
	);
}