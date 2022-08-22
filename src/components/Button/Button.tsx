/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/display-name */
import Config from '@/bao/lib/config'
import { classNames } from '@/functions/styling'
import { faExternalLinkAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ReactNode, useMemo } from 'react'
import styled from 'styled-components'
import Loader from '../Loader'
import Typography from '../Typography'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const Size = {
	xs: 'text-sm rounded-lg px-2 h-8',
	sm: 'text-base rounded-lg px-3 h-10',
	md: 'text-lg rounded-lg px-4 h-12',
	lg: 'text-xl rounded-lg px-6 h-16',
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
					'font-bold relative items-center justify-center gap-1 overflow-hidden border border-solid border-primary-300 bg-primary-200 text-text-100 outline-0 duration-200 hover:bg-primary-300',
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

export const MaxButton = ({ onClick }: MaxButtonProps) => {
	return (
		<button
			className='text-default font-strong m-auto mr-2 h-[80%] select-none rounded-lg !border !border-solid
			!border-primary-400/50 bg-primary-200 p-2 align-middle text-text-100 no-underline duration-200 hover:cursor-pointer
			hover:bg-primary-300 hover:text-text-100 md:text-sm'
			onClick={onClick}
		>
			MAX
		</button>
	)
}

type MaxButtonProps = {
	onClick: (e: any) => void
}

type NavButtonProps = {
	onClick: (s: any) => void
	active: string
	options: string[]
}

export const NavButtons = ({ options, active, onClick }: NavButtonProps) => (
	<div className='flex w-full cursor-pointer mt-2 gap-2'>
		{options.map((option: string) => (
			<Button size='md' key={option} className={`w-full ${option === active ? 'bg-primary-300' : 'bg-primary-200'}`} onClick={() => onClick(option)}>
				{option}
			</Button>
		))}
	</div>
)

type CloseButtonProps = {
	onClick: (s: any) => void
	onHide: () => void
}

export const CloseButton = ({ onHide }: CloseButtonProps) => (
	<a className='absolute top-24 right-8 text-2xl text-text-100 hover:cursor-pointer hover:text-text-400' onClick={onHide}>
		<FontAwesomeIcon icon={faTimes} />
	</a>
)

export const CloseButtonLeft = ({ onHide }: CloseButtonProps) => (
	<a className='absolute top-24 left-8 text-2xl text-text-100 hover:cursor-pointer hover:text-text-400' onClick={onHide}>
		<FontAwesomeIcon icon={faTimes} />
	</a>
)

export const SubmitButton = styled.button`
	display: inline-flex;
	appearance: none;
	align-items: center;
	justify-content: center;
	user-select: none;
	position: relative;
	white-space: nowrap;
	vertical-align: middle;
	outline-offset: 2px;
	width: 100%;
	line-height: 1.2;
	font-weight: ${props => props.theme.fontWeight.strong};
	transition-property: all;
	height: 50px;
	min-width: 2.5rem;
	font-size: ${props => props.theme.fontSize.default};
	padding-inline-start: 1rem;
	padding-inline-end: 1rem;
	border: ${props => props.theme.border.default};
	background-color: ${props => props.theme.color.primary[200]};
	outline: none;
	border-radius: 8px;
	color: ${props => props.theme.color.text[100]};
	opacity: ${props => (props.disabled ? 0.5 : 1)};
	transition: 200ms;
	overflow: hidden;
	margin-bottom: 6px;

	&:focus {
		outline: 0;
	}

	&:hover {
		background: ${props => props.theme.color.primary[300]};
		cursor: pointer;
		color: ${props => props.theme.color.text[100]};
	}

	&:hover,
	&:focus,
	&:active {
		color: ${props => (!props.disabled ? props.color : `${props.color}`)};
		cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')} !important;
	}
`

export const WalletButton = styled.button`
	display: inline-flex;
	appearance: none;
	align-items: center;
	justify-content: center;
	user-select: none;
	position: relative;
	white-space: nowrap;
	vertical-align: middle;
	outline-offset: 2px;
	width: 100%;
	line-height: 1.2;
	font-weight: ${props => props.theme.fontWeight.medium};
	transition-property: all;
	height: 50px;
	min-width: 2.5rem;
	font-size: ${props => props.theme.fontSize.default};
	padding-inline-start: 1rem;
	padding-inline-end: 1rem;
	border-radius: ${props => props.theme.borderRadius}px;
	border: ${props => props.theme.border.default};
	background-color: ${props => props.theme.color.primary[200]};
	outline: transparent solid 2px;
	color: ${props => props.theme.color.text[100]};
	opacity: ${props => (props.disabled ? 0.5 : 1)};
	transition: 200ms;
	overflow: hidden;
	margin-bottom: 10px;

	&:focus {
		outline: 0;
	}

	  &:hover{
		background: ${props => props.theme.color.primary[300]};
		cursor: pointer;
	  }
	}
	
	&:hover,
	&:focus,
	&:active {
		color: ${props => (!props.disabled ? props.color : `${props.color}`)};
		cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')} !important;
	}
`

export const ButtonStack = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`

export const CornerButtons = styled.div`
	float: right;
	top: ${props => props.theme.spacing[4]}px;
	margin-top: ${props => props.theme.spacing[4]}px;
	right: ${props => props.theme.spacing[4]}px;
	font-size: 1.5rem;
	color: ${props => props.theme.color.text[100]};

	&:hover {
		cursor: pointer;
	}

	@media (min-width: ${props => props.theme.breakpoints.sm}px) {
		right: 10%;
	}
`

export const CornerButton = styled.a`
	float: right;
	margin-top: ${props => props.theme.spacing[2]}px;
	margin-right: ${props => props.theme.spacing[3]}px;
	font-size: 1.5rem;
	vertical-align: middle;
	color: ${props => props.theme.color.text[100]};

	&:hover {
		cursor: pointer;
	}
`

export const PrefButtons = styled.div`
	margin: auto;
	display: inline-block;

	> button {
		float: left;
		margin-left: ${props => props.theme.spacing[2]}px;
		margin-top: ${props => props.theme.spacing[4]}px;
		color: ${props => props.theme.color.text[100]};
		border: ${props => props.theme.border.default};
		border-radius: ${props => props.theme.borderRadius}px;
		width: 48px;
		background: ${props => props.theme.color.primary[200]};

		&:hover,
		&.active,
		&:active,
		&:focus {
			color: ${props => props.theme.color.text[100]};
			background: ${props => props.theme.color.primary[300]};
			box-shadow: none !important;
		}
	}

	@media (max-width: ${props => props.theme.breakpoints.sm}px) {
		display: none;
	}
`
