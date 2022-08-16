import React, { FC, ReactNode } from 'react'
import { classNames } from '@/functions/styling'

export interface ModalBodyProps {
	children: ReactNode
	className?: string
}

const ModalBody: FC<ModalBodyProps> = ({ className = '', children }) => {
	return <div className={classNames('lg:min-w-lg flex h-full flex-col gap-4 lg:max-w-lg', className)}>{children}</div>
}

export default ModalBody
