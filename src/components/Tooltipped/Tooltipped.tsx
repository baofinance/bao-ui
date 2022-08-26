import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from '@material-tailwind/react'
import React from 'react'

import { classNames } from '@/functions/styling'

interface TooltippedProps {
	content: any
	children?: any
	placement?: any
	className?: any
}

const Tooltipped: React.FC<TooltippedProps> = ({ children, content, placement, className }) => (
	<>
		<Tooltip
			id={Math.random().toString()}
			content={content}
			placement={placement}
			offset={10}
			className={classNames('max-w-xs border border-primary-300 bg-primary-100 p-2 text-center', className)}
		>
			{children || (
				<span>
					<FontAwesomeIcon icon={faQuestionCircle} className='text-text-100 duration-200 hover:text-text-400' />
				</span>
			)}
		</Tooltip>
	</>
)

export default Tooltipped
export type { TooltippedProps }
