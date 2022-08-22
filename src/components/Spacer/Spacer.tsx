import { classNames } from '@/functions/styling'
import React, { AllHTMLAttributes, FC, forwardRef, ReactHTML } from 'react'

type SpacerVariant = 'sm' | 'md' | 'lg'

const SIZE = {
	sm: 'h-2 w-2',
	md: 'h-4 w-4',
	lg: 'h-6 w-g',
}

interface SpacerProps extends AllHTMLAttributes<ReactHTML> {
	variant?: SpacerVariant
	component?: keyof ReactHTML
	className?: string
}

const Spacer: FC<SpacerProps> = forwardRef(({ variant = 'md', component = 'div', className = '', children = [], ...rest }, ref) => {
	return React.createElement(
		component,
		{
			className: classNames(
				SIZE[variant],
				// @ts-ignore TYPE NEEDS FIXING
				className,
			),
			...rest,
			ref,
		},
		children,
	)
})

export default Spacer
