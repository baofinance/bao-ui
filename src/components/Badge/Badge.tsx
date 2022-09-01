import { Chip } from '@material-tailwind/react/components/Chip'

import classNames from 'classnames'

interface BadgeProps {
	children: any
	color?: string
	className?: string
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', color }) => {
	return (
		<Chip
			className={classNames('bg-primary-200 px-2 py-1 text-sm font-medium', className)}
			style={{ backgroundColor: `${color}` }}
			value={children}
		/>
	)
}

export default Badge
