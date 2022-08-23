import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Tooltip } from '@material-tailwind/react'

interface TooltippedProps {
	content: any
	children?: any
	placement?: any
}

const Tooltipped: React.FC<TooltippedProps> = ({ children, content, placement }) => (
	<>
		<Tooltip id={Math.random().toString()} content={content} placement={placement} offset={10} className='bg-primary-100 text-center text-text-100 p-2 max-w-xs'>
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
