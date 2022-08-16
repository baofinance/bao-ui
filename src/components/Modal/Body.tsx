import React, { FC, ReactNode } from 'react'
import { classNames } from 'src/functions/styling'

export interface ModalBodyProps {
	className?: string
	children?: ReactNode
}

const ModalBody: FC<ModalBodyProps> = ({ className = '', children }) => {
	return <div className={classNames('mb-2 w-full flex-1', className)}>{children}</div>
}

export default ModalBody
