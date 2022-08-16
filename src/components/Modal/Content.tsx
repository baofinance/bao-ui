import { classNames } from '@/functions/styling'
import React, { FC, HTMLProps, ReactNode } from 'react'

export interface ModalContentProps {
	children?: ReactNode
	className?: string
}

const ModalContent: FC<ModalContentProps> = ({ children, className = '' }) => {
	return <div className={classNames('', className)}>{children}</div>
}

export interface ModalContentBorderedProps extends HTMLProps<HTMLDivElement> {
	className?: string
}

export const BorderedModalContent: FC<ModalContentBorderedProps> = ({ children, className, ...rest }) => {
	return (
		<div {...rest} className={classNames(className, 'border-dark-800/60 rounded border p-4')}>
			{children}
		</div>
	)
}

export default ModalContent
