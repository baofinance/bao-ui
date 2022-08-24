import { classNames } from '@/functions/styling'
import React, { ReactNode } from 'react'

interface ContainerProps {
	children: ReactNode
	className?: string
}

const Container = ({ children, className }: ContainerProps) => (
	<div className={classNames('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
)

export default Container

export const AbsoluteContainer = ({ children }: ContainerProps) => (
	<div className='absolute top-[50%] -mt-80 w-full pl-4 pr-4 md:left-[50%] md:-ml-96 md:w-[720px]'>{children}</div>
)
