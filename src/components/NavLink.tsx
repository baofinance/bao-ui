import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { FC, ReactNode } from 'react'

interface NavLinkProps extends LinkProps {
	children: ReactNode
	href: string
	className?: string
	exact?: boolean
}

const NavLink: FC<NavLinkProps> = ({ href, exact, children, className, ...props }) => {
	const { pathname } = useRouter()
	const isActive = exact ? pathname === href : pathname.startsWith(href)

	if (isActive) {
		className += 'active'
	}

	return (
		<Link href={href}>
			<a {...props} className={`text-rubik font-medium text-text-100 antialiased hover:text-text-400 ${className}`}>
				{children}
			</a>
		</Link>
	)
}

export default NavLink
