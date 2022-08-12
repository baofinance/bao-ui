import baoLogo from 'assets/img/tokens/BAO.png'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Logo: React.FC = () => {
	return (
		<StyledLogo to='/'>
			<img src={baoLogo} height={32} width={31} style={{ verticalAlign: 'middle' }} alt='Bao' />
			<StyledText>
				<TitleText>Bao Finance</TitleText>
			</StyledText>
		</StyledLogo>
	)
}

const TitleText = styled.div`
	width: fit-content;
	white-space: nowrap;
	color: ${props => props.theme.color.text[100]};
	font-family: 'Kaushan Script', sans-serif;
	font-size: 1.5rem;
	letter-spacing: 0.03rem;
	margin-left: ${props => props.theme.spacing[1]}px;
`

const StyledLogo = styled(Link)`
	align-items: center;
	display: flex;
	justify-content: center;
	margin: 0;
	min-height: 60px;
	min-width: 60px;
	padding: 0;
	text-decoration: none;
`

const StyledText = styled.span`
	color: ${props => props.theme.color.text[100]};
	font-family: 'Rubik', sans-serif;
	font-size: 1.25rem;
	font-weight: ${props => props.theme.fontWeight.strong};
	letter-spacing: 0.03em;
	margin-left: ${props => props.theme.spacing[1]}px;

	@media (max-width: ${props => props.theme.breakpoints.xl}px) {
		display: none;
	}
`

export default Logo
