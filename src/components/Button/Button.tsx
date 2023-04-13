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
	xs: 'rounded px-2 h-8',
	sm: 'rounded px-4 h-10',
	md: 'rounded px-6 h-12',
	lg: 'rounded px-8 h-16',
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
					<a href={href} target='_blank' rel='noreferrer' className='hover:text-baoWhite focus:text-baoWhite'>
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
				<a href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noreferrer' className='text-baoWhite'>
					Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
				</a>
			) : (
				'Pending Transaction'
			)
		) : (
			children
		)

		return (
			<button
				{...rest}
				ref={ref}
				disabled={isDisabled}
				className={classNames(
					// @ts-ignore TYPE NEEDS FIXING
					Size[size],
					inline ? 'inline-block' : 'flex',
					fullWidth ? 'w-full' : '',
					disabled ? 'cursor-not-allowed opacity-50' : '',
					`relative items-center justify-center gap-1 overflow-hidden font-bakbak`,
					'border border-baoRed bg-baoBlack duration-200 hover:bg-baoRed',
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
			</button>
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
		<div className='flex w-full cursor-pointer gap-2'>
			{options.map((option: string) => (
				<Button
					size='md'
					key={option}
					className={classNames(`${option === active && '!bg-transparent-100'} w-full`, className)}
					onClick={() => onClick(option)}
				>
					{option}
				</Button>
			))}
		</div>
	)
}
