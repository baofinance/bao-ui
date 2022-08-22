import React, { FC, ReactNode } from 'react'
import { classNames } from '@/functions/styling'

export interface ModalBodyProps {
	children: ReactNode
	className?: string
}

const ModalBody: FC<ModalBodyProps> = ({ className = '', children }) => {
	return <div className={classNames('relative flex-1 mb-4', className)}>{children}</div>
}

export default ModalBody
