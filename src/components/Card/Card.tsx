import { classNames } from '@/functions/styling'
import React, { FC, ReactNode } from 'react'
import CardActions, { CardActionsProps } from './Actions'
import CardBody, { CardBodyProps } from './Body'
import CardHeader, { CardHeaderProps } from './Header'

const MAX_WIDTH_CLASS_MAPPING = {
	sm: 'lg:max-w-sm',
	md: 'lg:max-w-md',
	lg: 'lg:max-w-lg',
	xl: 'lg:max-w-xl',
	'2xl': 'lg:max-w-2xl',
	'3xl': 'lg:max-w-3xl',
}

type CardType<P> = FC<P> & {
	Header: FC<CardHeaderProps>
	Body: FC<CardBodyProps>
	Actions: FC<CardActionsProps>
}

interface CardProps {
	children?: ReactNode
	className?: string
}

const Card: CardType<CardProps> = ({ children, className }) => {
	return (
		<div className='flex flex-col justify-center'>
			<div
				className={classNames(
					'relative flex flex-col items-center break-words rounded-lg border border-primary-300 bg-primary-100 bg-clip-border p-3 shadow-2xl shadow-primary-300/50',
					className,
				)}
			>
				{children}
			</div>
		</div>
	)
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Actions = CardActions

export default Card
