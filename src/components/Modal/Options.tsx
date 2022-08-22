import React, { FC, ReactNode } from 'react'

export interface ModalOptionsProps {
	children?: ReactNode
}

const ModalOptions: FC<ModalOptionsProps> = ({ children }) => {
	return <div className='flex items-center justify-end mb-4'>{children}</div>
}

export default ModalOptions
