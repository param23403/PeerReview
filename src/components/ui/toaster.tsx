import { useToast } from "../../hooks/use-toast"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast"
import { FaCheck } from "react-icons/fa6"
import { MdErrorOutline } from "react-icons/md"

export function Toaster() {
	const { toasts } = useToast()

	return (
		<ToastProvider>
			{toasts.map(function ({ id, title, description, action, ...props }) {
				return (
					<Toast key={id} {...props}>
						<div className="flex items-center gap-6">
							{props.variant === "success" && <FaCheck />}
							{props.variant === "destructive" && <MdErrorOutline size={24} />}
							<div className="">
								{title && <ToastTitle>{title}</ToastTitle>}
								{description && <ToastDescription>{description}</ToastDescription>}
							</div>
							{action}
						</div>
						<ToastClose />
					</Toast>
				)
			})}
			<ToastViewport />
		</ToastProvider>
	)
}
