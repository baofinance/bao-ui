import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Placement } from 'react-bootstrap/types'

interface TooltippedProps {
	content: any
	children?: JSX.Element
	placement?: Placement
}

const Tooltipped: React.FC<TooltippedProps> = ({ children, content, placement }) => (
	<>
		<OverlayTrigger key={placement} overlay={<Tooltip id={Math.random().toString()}>{content}</Tooltip>} placement={placement || 'bottom'}>
			{children || (
				<span>
					<FontAwesomeIcon icon={faQuestionCircle} className='text-text-100 duration-200 hover:text-text-400' />
				</span>
			)}
		</OverlayTrigger>
	</>
)

export default Tooltipped
export type { TooltippedProps }
