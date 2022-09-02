import React, { FC, ReactNode } from 'react'

export interface CardActionsProps {
	children?: ReactNode
}

const CardActions: FC<CardActionsProps> = ({ children }) => {
	return <div className='w-full items-center justify-end gap-4'>{children}</div>
}

export default CardActions
