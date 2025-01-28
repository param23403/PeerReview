import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { auth } from "../firebase"
import { signOut } from "firebase/auth"
import { MdOutlineLogin } from "react-icons/md"
import { MdOutlineLogout } from "react-icons/md"

const Navbar = () => {
	const [isOpen, setIsOpen] = React.useState(false)
	const { user, userData, loading } = useAuth()
	const navigate = useNavigate()

	const handleLogout = async () => {
		try {
			await signOut(auth)
			navigate("/")
		} catch (error) {
			console.error("Error logging out:", error)
		}
	}

	const navItems = React.useMemo(() => {
		if (!user && !loading) {
			return [
				{
					name: "Login",
					href: "/login",
					icon: <MdOutlineLogin className="mr-2 h-4 w-4" />,
					variant: "outline",
				},
			]
		} else if (userData?.role === "student") {
			return [
				{ name: "Sprints", href: "/sprints" },
				{ name: "Settings", href: "/settings" },
				{
					name: "Logout",
					href: "/",
					icon: <MdOutlineLogout className="mr-2 h-4 w-4" />,
					variant: "outline",
					action: handleLogout,
				},
			]
		} else if (userData?.role === "professor") {
			return [
				{ name: "Teams", href: "/teams" },
				{ name: "Students", href: "/students" },
				{ name: "Reviews", href: "/reviews" },
				{ name: "Settings", href: "/settings" },
				{
					name: "Logout",
					href: "/",
					icon: <MdOutlineLogout className="mr-2 h-4 w-4" />,
					variant: "outline",
					action: handleLogout,
				},
			]
		}
		return []
	}, [user, userData, handleLogout])

	return (
		<nav className="bg-background fixed w-screen top-0 z-10">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center">
						<NavLink to="/" className="flex-shrink-0">
							<span className="text-2xl font-bold text-primary">PeerReview</span>
						</NavLink>
					</div>
					<div className="hidden md:block">
						<div className="ml-10 flex items-center space-x-4">
							{navItems.map((item: any) => (
								<NavLink key={item.name} to={item.href}>
									{({ isActive }) => (
										<Button
											variant={"link"}
											onClick={item.action}
											className={`flex items-center ${isActive ? "font-bold" : ""}`}
										>
											{item.icon}
											{item.name}
										</Button>
									)}
								</NavLink>
							))}
						</div>
					</div>
					<div className="md:hidden">
						<Sheet open={isOpen} onOpenChange={setIsOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="md:hidden">
									<Menu className="h-5 w-5" />
									<span className="sr-only">Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-[240px] sm:w-[300px]">
								<div className="mt-6 flow-root">
									<div className="space-y-2 py-6">
										{navItems.map((item: any) => (
											<NavLink key={item.name} to={item.href}>
												{({ isActive }) => (
													<Button
														variant={item.variant || "link"}
														onClick={item.action}
														className={`flex items-center ${isActive ? "font-bold" : ""}`}
													>
														{item.icon}
														{item.name}
													</Button>
												)}
											</NavLink>
										))}
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
