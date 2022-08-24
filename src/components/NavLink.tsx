import { AnimatePresence, motion } from 'framer-motion'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { FC, ReactNode, useState } from 'react'

interface NavLinkProps extends LinkProps {
	children: ReactNode
	href: string
	key: string
	index: any
	className?: string
	exact?: boolean
}

const NavLink: FC<NavLinkProps> = ({ href, exact, children, className, index, key }) => {
	const { pathname } = useRouter()
	const isActive = exact ? pathname === href : pathname.startsWith(href)
	const [hoveredIndex, setHoveredIndex] = useState(null)

	if (isActive) {
		className += 'active'
	}

	return (
		<Link key={key} href={href} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
			<AnimatePresence>
				{hoveredIndex === index && (
					<motion.span
						className='absolute inset-0 rounded-lg bg-gray-100'
						layoutId='hoverBackground'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1, transition: { duration: 0.15 } }}
						exit={{
							opacity: 0,
							transition: { duration: 0.15, delay: 0.2 },
						}}
					/>
				)}
			</AnimatePresence>
			<span className={`text-rubik font-medium text-text-100 antialiased hover:text-text-400 ${className}`}>
				{children}
			</span>
		</Link>
	)
}

export default NavLink
