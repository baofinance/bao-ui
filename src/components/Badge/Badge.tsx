import { Chip } from '@material-tailwind/react'

import { classNames } from '@/bao/lib/styling'

interface BadgeProps {
	children: any
	color?: string
	className?: string
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', color }) => {
	return (
		<Chip
			className={classNames('bg-primary-200 px-2 py-1 text-sm font-medium', className)}
			style={{ backgroundColor: `${color} !important` }}
			value={children}
		/>
	)
}

export default Badge
