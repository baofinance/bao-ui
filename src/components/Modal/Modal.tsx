/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Dialog, Transition } from '@headlessui/react'
import React, { cloneElement, FC, Fragment, isValidElement, ReactNode, useCallback, useMemo, useState } from 'react'

import ModalAction, { ModalActionProps } from '@/components/Modal/Action'
import ModalActions, { ModalActionsProps } from '@/components/Modal/Actions'
import ModalBody, { ModalBodyProps } from '@/components/Modal/Body'
import ModalContent, { BorderedModalContent, ModalContentBorderedProps, ModalContentProps } from '@/components/Modal/Content'
import ModalError, { ModalActionErrorProps } from '@/components/Modal/Error'
import ModalHeader, { ModalHeaderProps } from '@/components/Modal/Header'
import SubmittedModalContent, { SubmittedModalContentProps } from '@/components/Modal/SubmittedModalContent'
import { classNames } from '@/functions/styling'
import useDesktopMediaQuery from '@/hooks/base/useDesktopMediaQuery'

const MAX_WIDTH_CLASS_MAPPING = {
	sm: 'lg:max-w-sm',
	md: 'lg:max-w-md',
	lg: 'lg:max-w-lg',
	xl: 'lg:max-w-xl',
	'2xl': 'lg:max-w-2xl',
	'3xl': 'lg:max-w-3xl',
}

interface TriggerProps {
	show: boolean
	setShow: (x: boolean) => void
	onClick: () => void
}

interface Props {
	children?: ReactNode | FC
	trigger?: (({ show, onClick, setShow }: TriggerProps) => ReactNode) | ReactNode
}

type ModalType<P> = FC<P> & {
	Controlled: FC<ControlledModalProps>
	Body: FC<ModalBodyProps>
	Actions: FC<ModalActionsProps>
	Content: FC<ModalContentProps>
	BorderedContent: FC<ModalContentBorderedProps>
	Header: FC<ModalHeaderProps>
	Action: FC<ModalActionProps>
	SubmittedModalContent: FC<SubmittedModalContentProps>
	Error: FC<ModalActionErrorProps>
}

const Modal: ModalType<Props> = ({ children: childrenProp, trigger: triggerProp }) => {
	const [show, setShow] = useState(false)

	const onClick = useCallback(() => {
		setShow(true)
	}, [])

	// If trigger is a function, render props
	// Else (default), check if element is valid and pass click handler
	const trigger = useMemo(
		() =>
			typeof triggerProp === 'function'
				? triggerProp({ onClick, show, setShow })
				: isValidElement(triggerProp)
				? cloneElement(triggerProp, { onClick })
				: null,
		[onClick, show, triggerProp],
	)

	// If children is a function, render props
	// Else just render normally
	// @ts-ignore TYPE NEEDS FIXING
	const children = useMemo(
		() => (typeof childrenProp === 'function' ? childrenProp({ onClick, show, setShow }) : children),
		[onClick, show, childrenProp],
	)

	return (
		<>
			{trigger && trigger}
			<ModalControlled isOpen={show} onDismiss={() => setShow(false)}>
				{children}
			</ModalControlled>
		</>
	)
}

interface ControlledModalProps {
	isOpen: boolean
	onDismiss: () => void
	afterLeave?: () => void
	children?: React.ReactNode
	transparent?: boolean
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
	unmount?: boolean
}

const ModalControlled: FC<ControlledModalProps> = ({
	isOpen,
	onDismiss,
	afterLeave,
	children,
	transparent = false,
	maxWidth = 'lg',
	unmount,
}) => {
	const isDesktop = useDesktopMediaQuery()
	return (
		<Transition appear show={isOpen} as={Fragment} afterLeave={afterLeave} unmount={unmount}>
			<Dialog as='div' className='fixed inset-0 z-50' onClose={onDismiss} unmount={unmount}>
				<div className='relative block flex min-h-screen items-center justify-center text-center'>
					<Transition.Child
						unmount={false}
						as={Fragment}
						enter='ease-out duration-150'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='ease-in duration-150'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<Dialog.Overlay
							className={classNames(
								isDesktop ? 'bg-[rgb(0,0,0,0.4)]  backdrop-blur-[10px]' : ' bg-[rgb(0,0,0,0.8)]',
								'fixed inset-0 filter',
							)}
						/>
					</Transition.Child>

					{/* This element is to trick the browser into centering the modal contents. */}
					<span className='inline-block h-screen align-middle' aria-hidden='true'>
						&#8203;
					</span>

					<Transition.Child
						unmount={unmount}
						as={Fragment}
						enter='ease-out duration-150'
						enterFrom='opacity-0 scale-95'
						enterTo='opacity-100 scale-100'
						leave='ease-in duration-150'
						leaveFrom='opacity-100 scale-100'
						leaveTo='opacity-0 scale-95'
					>
						<div
							className={classNames(
								transparent ? '' : 'bg-dark-900 border-dark-800 border',
								isDesktop ? MAX_WIDTH_CLASS_MAPPING[maxWidth] : '',
								isDesktop ? `w-full` : 'mx-auto max-h-[85vh] w-[85vw] overflow-y-auto',
								'inline-block transform overflow-hidden rounded-xl p-4 text-left align-bottom',
							)}
						>
							{children}
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	)
}

Modal.Controlled = ModalControlled
Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Content = ModalContent
Modal.BorderedContent = BorderedModalContent
Modal.Actions = ModalActions
Modal.Action = ModalAction
Modal.Error = ModalError
Modal.SubmittedModalContent = SubmittedModalContent

export default Modal
