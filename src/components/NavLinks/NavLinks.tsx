import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const NavLinks: React.FC = () => {
	const [hoveredIndex, setHoveredIndex] = useState(0)

	const navigation = [
		{ name: 'Markets', href: '/markets' },
		{ name: 'Ballast', href: '/ballast' },
		{ name: 'Baskets', href: '/baskets' },
		{ name: 'Farms', href: '/farms' },
		{ name: 'NFT', href: '/nft' },
	]

	const externalLinks = [
		{ name: 'Vote', href: 'https://snapshot.page/#/baovotes.eth' },
		{ name: 'Forum', href: 'https://gov.bao.finance' },
		{ name: 'Docs', href: 'https://docs.bao.finance' },
	]

	return (
		<>
			{navigation.map((link, index) => (
				<Link
					href={link.href}
					key={link.name}
					className='relative -my-2 -mx-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors delay-150 hover:text-gray-900 hover:delay-[0ms]'
					onMouseEnter={() => setHoveredIndex(index)}
					onMouseLeave={() => setHoveredIndex(0)}
				>
					<a>
						<AnimatePresence>
							{hoveredIndex === index && (
								<motion.span
									className='absolute inset-0 rounded-lg'
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
						<span className='relative z-10'>{link.name}</span>
					</a>
				</Link>
			))}
			{externalLinks.map((link, index) => (
				<a
					href={link.href}
					key={link.name}
					target='_blank'
					rel='noreferrer'
					className='text-rubik font-medium text-text-100 antialiased hover:text-text-400'
					onMouseEnter={() => setHoveredIndex(index)}
					onMouseLeave={() => setHoveredIndex(0)}
				>
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
					<span className='relative z-10'>{link.name}</span>
				</a>
			))}
		</>
	)
}

export default NavLinks
