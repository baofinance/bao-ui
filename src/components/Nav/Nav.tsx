import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'

interface NavLinkProps {
	href?: string
	className?: string
	exact?: boolean
}

const Nav: FC<NavLinkProps> = ({ href, exact, className }) => {
	const { pathname } = useRouter()
	const isActive = exact ? pathname === href : pathname.startsWith(href)
	const [hoveredIndex, setHoveredIndex] = useState(null)

	if (isActive) {
		className += 'active'
	}

	const navigation = [
		['0', 'Markets', '/'],
		['1', 'Ballast', '/ballast'],
		['2', 'Baskets', '/baskets'],
		['3', 'Farms', '/farms'],
		['4', 'veBAO', '/vebao'],
		['5', 'Migration', '/migration'],
	]

	return (
		<>
			{navigation.map(([index, name, href]) => (
				<Link
					href={href}
					key={name}
					className='relative -my-2 -mx-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors delay-150 hover:delay-[0ms]'
					onMouseEnter={() => setHoveredIndex(index as any)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<AnimatePresence>
						{hoveredIndex === index && (
							<motion.span
								className={`absolute inset-0 rounded-lg bg-primary-100`}
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
					<span className={`relative z-10 ${isActive && 'bg-primary-100'}`}>{name}</span>
				</Link>
			))}
		</>
	)
}

export default Nav
