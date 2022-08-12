import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

interface ValueProps {
	value: string | number
	decimals?: number
}

const Value: React.FC<ValueProps> = ({ value }) => {
	return <StyledValue>{value}</StyledValue>
}

const StyledValue = styled.div`
	font-family: 'Rubik', sans-serif;
	color: ${props => props.theme.color.text[100]};
	font-size: 2rem;
	font-weight: ${props => props.theme.fontWeight.medium};
`

export default Value
