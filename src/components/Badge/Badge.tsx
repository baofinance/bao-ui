import { classNames } from '@/functions/styling'
import { Chip } from '@material-tailwind/react'
import { isDesktop } from 'react-device-detect'

interface BadgeProps {
	children: any
	color?: string
	className?: string
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', color }) => {
	return (
		<Chip
			className={classNames('bg-primary-200 px-2 py-1 text-base font-medium', isDesktop ? 'text-base' : 'text-sm', className)}
			style={{ backgroundColor: `${color} !important` }}
			value={children}
		/>
	)
}

export default Badge
