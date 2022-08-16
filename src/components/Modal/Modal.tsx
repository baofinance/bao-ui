import React, { FC, ReactNode } from 'react'
import ModalActions, { ModalActionsProps } from './Actions'
import ModalBody, { ModalBodyProps } from './Body'
import ModalHeader, { ModalHeaderProps } from './Header'

const MAX_WIDTH_CLASS_MAPPING = {
	sm: 'lg:max-w-sm',
	md: 'lg:max-w-md',
	lg: 'lg:max-w-lg',
	xl: 'lg:max-w-xl',
	'2xl': 'lg:max-w-2xl',
	'3xl': 'lg:max-w-3xl',
}

type ModalType<P> = FC<P> & {
	Header: FC<ModalHeaderProps>
	Body: FC<ModalBodyProps>
	Actions: FC<ModalActionsProps>
}

interface ModalProps {
	children?: ReactNode
}

const Modal: ModalType<ModalProps> = ({ children }) => {
	return (
		<div className='mx-2 mb-2 flex flex-col justify-center'>
			<div className='relative flex flex-col items-center break-words rounded-lg !border !border-solid !border-primary-300 bg-primary-100 bg-clip-border p-3 shadow-2xl shadow-primary-300/50'>
				{children}
			</div>
		</div>
	)
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Actions = ModalActions

export default Modal
