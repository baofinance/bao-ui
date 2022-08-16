import React, { FC, ReactNode } from 'react'

export interface ModalActionsProps {
	children?: ReactNode
}

const ModalActions: FC<ModalActionsProps> = ({ children }) => {
	return <div className='flex items-center justify-end gap-4'>{children}</div>
}

export default ModalActions
