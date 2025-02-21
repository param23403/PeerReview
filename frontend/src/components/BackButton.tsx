import { Button } from "./ui/button"
import { FaArrowLeft } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"

interface BackButtonProps {
	to?: string
	useNavigateBack?: boolean
}

const BackButton = ({ to = "/", useNavigateBack = false }: BackButtonProps) => {
	const navigate = useNavigate()

	const handleClick = () => {
		if (useNavigateBack) {
			navigate(-1)
		}
	}

	return useNavigateBack ? (
		<Button variant="ghost" className="items-center mb-4" onClick={handleClick}>
			<FaArrowLeft className="mr-2 w-4 h-4" /> Back
		</Button>
	) : (
		<Button asChild variant="ghost" className="items-center mb-4">
			<Link to={to}>
				<FaArrowLeft className="mr-2 w-4 h-4" /> Back
			</Link>
		</Button>
	)
}

export default BackButton
