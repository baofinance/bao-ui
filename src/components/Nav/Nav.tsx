import useDistributionInfo from '@/hooks/distribution/useDistributionInfo'
import useProofs from '@/hooks/distribution/useProofs'
import useUserFarmInfo from '@/hooks/farms/useUserFarmInfo'
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
		['0', 'VAULTS', '/vaults'],
		['1', 'BALLAST', '/ballast'],
		['2', 'BASKETS', '/baskets'],
		['3', 'GAUGES', '/gauges'],
		['4', 'veBAO', '/vebao'],
	]

	const merkleLeaf = useProofs()
	const dist = useDistributionInfo()
	const canStartDistribution = !!merkleLeaf && !!dist

	const farm1Balance = useUserFarmInfo(0)
	const farm2Balance = useUserFarmInfo(200)
	const farm3Balance = useUserFarmInfo(201)

	return (
		<>
			{navigation.map(([index, name, href]) => (
				<Link
					href={href}
					key={name}
					className='relative -mx-3 -my-2 rounded px-3 py-2 font-bakbak text-xl transition-colors delay-150 hover:delay-[0ms]'
					onMouseEnter={() => setHoveredIndex(index as any)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<AnimatePresence>
						{hoveredIndex === index && (
							<motion.span
								className={`absolute inset-0 rounded bg-baoRed`}
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
					<span className={`relative z-10 ${isActive && 'bg-baoRed'}`}>{name}</span>
				</Link>
			))}
			{canStartDistribution && (
				<Link
					href='/distribution'
					key='Distribution'
					className='relative -mx-3 -my-2 rounded px-3 py-2 font-bakbak text-xl transition-colors delay-150 hover:delay-[0ms]'
					onMouseEnter={() => setHoveredIndex(6)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<AnimatePresence>
						{hoveredIndex === 6 && (
							<motion.span
								className={`absolute inset-0 rounded bg-baoRed`}
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
					<span className={`relative z-10 ${isActive && 'bg-baoRed'}`}>DISTRIBUTION</span>
				</Link>
			)}
			{(farm1Balance?.amount.gt(0) || farm2Balance?.amount.gt(0) || farm3Balance?.amount.gt(0)) && (
				<Link
					href='/farms'
					key='Farms'
					className='relative -mx-3 -my-2 rounded px-3 py-2 font-bakbak text-xl transition-colors delay-150 hover:delay-[0ms]'
					onMouseEnter={() => setHoveredIndex(5)}
					onMouseLeave={() => setHoveredIndex(null)}
				>
					<AnimatePresence>
						{hoveredIndex === 5 && (
							<motion.span
								className={`absolute inset-0 rounded bg-baoRed`}
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
					<span className={`relative z-10 text-xl ${isActive && 'bg-baoRed'}`}>FARMS</span>
				</Link>
			)}
		</>
	)
}

export default Nav
