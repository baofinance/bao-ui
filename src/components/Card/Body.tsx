import React, { FC, ReactNode } from 'react'

import { classNames } from '@/bao/lib/styling'

export interface CardBodyProps {
	className?: string
	children?: ReactNode
}

const CardBody: FC<CardBodyProps> = ({ className = '', children }) => {
	return <div className={classNames('mb-2 w-full flex-1', className)}>{children}</div>
}

export default CardBody
