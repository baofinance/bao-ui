import Link from 'next/link'
import { useRouter } from 'next/router'

interface NavLinkProps {
	children: React.ReactNode
	href: string
	className?: string
	exact?: boolean
}

const NavLink: React.FC<NavLinkProps> = ({ href, exact, children, ...props }) => {
	const { pathname } = useRouter()
	const isActive = exact ? pathname === href : pathname.startsWith(href)

	if (isActive) {
		props.className += 'active'
	}

	return (
		<Link href={href}>
			<a {...props} className={`text-rubik font-medium text-text-100 hover:text-text-400 antialiased ${props.className}`}>{children}</a>
		</Link>
	)
}

export default NavLink
