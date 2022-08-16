import Typography from '@/components/Typography'
import { classNames } from '@/functions/styling'
import React, { FC, ReactNode } from 'react'

export interface ModalActionErrorProps {
	children?: ReactNode
	className?: string
}

const ModalError: FC<ModalActionErrorProps> = ({ className = '', children }) => {
	if (!children) return <></>

	return (
		<Typography variant='xs' weight={700} className={classNames('text-center text-red', className)}>
			{children}
		</Typography>
	)
}

export default ModalError
