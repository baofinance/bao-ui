import React from 'react'
import styled from 'styled-components'

const Card: React.FC = ({ children }) => <StyledCard>{children}</StyledCard>

const StyledCard = styled.div`
background-color: ${(props) => props.theme.color.primary[100]};
box-shadow: ${(props) => props.theme.boxShadow.default};
border: ${(props) => props.theme.border.default};
  border-radius: ${(props) => props.theme.borderRadius}px;
	display: flex;
	flex: 1;
	flex-direction: column;
`

export default Card
