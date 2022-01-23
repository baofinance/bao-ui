import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import styled from 'styled-components'
import { Placement } from 'react-bootstrap/types'

interface TooltippedProps {
	content: any
	children?: JSX.Element
	placement?: Placement
}

const Tooltipped: React.FC<TooltippedProps> = ({
	children,
	content,
	placement,
}) => (
	<>
		<OverlayTrigger
			overlay={<Tooltip id={Math.random().toString()}>{content}</Tooltip>}
			placement={placement || 'bottom'}
		>
			{children || (
				<span>
					<QuestionIcon icon="question-circle" />
				</span>
			)}
		</OverlayTrigger>
	</>
)

const QuestionIcon = styled(FontAwesomeIcon)`
	color: ${(props) => props.theme.color.text[100]};

	&:hover,
	&:focus {
		color: ${(props) => props.theme.color.text[400]};
		animation: 200ms;
	}
`

export default Tooltipped
export type { TooltippedProps }
