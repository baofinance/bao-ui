/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/display-name */
import Config from '@/bao/lib/config'
import classNames from 'classnames'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ReactNode, useMemo } from 'react'
import Loader from '../Loader'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const Size = {
	xs: 'text-xs rounded px-2 h-8',
	sm: 'text-sm rounded px-3 h-10',
	md: 'text-base rounded px-4 h-12',
	lg: 'text-lg rounded px-6 h-16',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: ReactNode
	size?: ButtonSize
	fullWidth?: boolean
	pendingTx?: string
	inline?: boolean
	href?: string
	text?: any
	disabled?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, className = '', size = 'md', fullWidth = false, pendingTx, inline, text, href, disabled, ...rest }, ref) => {
		const ButtonChild = useMemo(() => {
			if (href) {
				return (
					<a href={href} target='_blank' rel='noreferrer' className='hover:text-text-100 focus:text-text-100'>
						{text}
					</a>
				)
			} else {
				return text
			}
		}, [href, text])

		const isDisabled = useMemo(() => typeof pendingTx === 'string' || pendingTx || disabled === true, [disabled, pendingTx])

		const buttonText = pendingTx ? (
			typeof pendingTx === 'string' ? (
				<a
					href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`}
					target='_blank'
					rel='noreferrer'
					className='hover:text-text-100 focus:text-text-100'
				>
					Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
				</a>
			) : (
				'Pending Transaction'
			)
		) : (
			children
		)

		return (
			<div
				{...rest}
				ref={ref}
				disabled={isDisabled}
				className={classNames(
					// @ts-ignore TYPE NEEDS FIXING
					Size[size],
					inline ? 'inline-block' : 'flex',
					fullWidth ? 'w-full' : '',
					disabled ? 'cursor-not-allowed opacity-50' : '',
					`relative items-center justify-center gap-1 overflow-hidden border font-semibold`,
					'border-primary-300 bg-primary-200 duration-200 hover:bg-primary-300',
					className,
				)}
			>
				{pendingTx ? (
					<Loader />
				) : (
					<>
						{ButtonChild}
						{buttonText}
					</>
				)}
			</div>
		)
	},
)

export default Button

type NavButtonProps = {
	onClick: (s: any) => void
	active: string
	options: string[]
	className?: string
}

export const NavButtons = ({ options, active, onClick, className }: NavButtonProps) => {
	return (
		<div className='mt-2 flex w-full cursor-pointer gap-2'>
			{options.map((option: string) => (
				<Button
					size='md'
					key={option}
					className={classNames(`${option === active && '!bg-primary-300'} w-full`, className)}
					onClick={() => onClick(option)}
				>
					{option}
				</Button>
			))}
		</div>
	)
}
