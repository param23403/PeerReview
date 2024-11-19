import * as React from "react"
import { Menu, X } from "lucide-react"

import { Button } from "../components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { NavLink } from "react-router-dom"

const navItems = [
	{ name: "Home", href: "/" },
	{ name: "About", href: "/about" },
	{ name: "Services", href: "/services" },
	{ name: "Contact", href: "/contact" },
]

export default function Navbar() {
	const [isOpen, setIsOpen] = React.useState(false)

	return (
		<nav className="bg-background">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center">
						<NavLink to="/" className="flex-shrink-0">
							<span className="text-2xl font-bold text-primary">PeerReview</span>
						</NavLink>
					</div>
					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-4">
							{navItems.map((item) => (
								<NavLink
									key={item.name}
									to={item.href}
									className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
								>
									{item.name}
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
										{navItems.map((item) => (
											<NavLink
												key={item.name}
												to={item.href}
												className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground"
												onClick={() => setIsOpen(false)}
											>
												{item.name}
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
