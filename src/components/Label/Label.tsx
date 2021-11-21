import React from 'react'
import styled from 'styled-components'

interface LabelProps {
	text?: string
}

const Label: React.FC<LabelProps> = ({ text }) => (
	<StyledLabel>{text}</StyledLabel>
)

const StyledLabel = styled.div`
	font-size: 0.875rem;
	color: ${(props) => props.theme.color.text[200]};
`

export default Label
