import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Nav: React.FC = () => {
	return (
		<StyledNav>
			<StyledLink
				exact
				activeClassName="active"
				to={{ pathname: '/' }}
			>
				Explorer
			</StyledLink>
			<StyledLink
				exact
				to={{ pathname: '/delphi/create' }}
			>
				Create
			</StyledLink>
			<StyledAbsoluteLink
				href="https://github.com/baofinance/delphi"
				target="_blank"
			>
				Delphi Repo
			</StyledAbsoluteLink>
			<StyledAbsoluteLink
				href="https://bao.finance"
				target="_blank"
			>
				Bao Finance
			</StyledAbsoluteLink>
		</StyledNav>
	)
}

const StyledNav = styled.nav`
	align-items: center;
	display: flex;
`

const StyledLink = styled(NavLink)`
	transition-property: all;
	transition-duration: 200ms;
	transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
	font-family: 'Rubik', sans-serif;
	color: ${(props) => props.theme.color.text[100]};
	font-weight: ${(props) => props.theme.fontWeight.medium};
	padding-left: ${(props) => props.theme.spacing[3]}px;
	padding-right: ${(props) => props.theme.spacing[3]}px;
	text-decoration: none;
	&:hover {
		color: ${(props) => props.theme.color.text[300]};
	}
	&.active {
		color: ${(props) => props.theme.color.text[400]};
	}
	@media (max-width: ${(props) => props.theme.breakpoints.sm}px) {
		padding-left: ${(props) => props.theme.spacing[2]}px;
		padding-right: ${(props) => props.theme.spacing[2]}px;
	}
`

const StyledAbsoluteLink = styled.a`
	transition-property: all;
	transition-duration: 200ms;
	transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
	font-family: 'Rubik', sans-serif;
	color: ${(props) => props.theme.color.text[100]};
	font-weight: ${(props) => props.theme.fontWeight.medium};
	padding-left: ${(props) => props.theme.spacing[3]}px;
	padding-right: ${(props) => props.theme.spacing[3]}px;
	text-decoration: none;
	&:hover {
		color: ${(props) => props.theme.color.text[300]};
	}
	&.active {
		color: ${(props) => props.theme.color.text[400]};
	}
	@media (max-width: ${(props) => props.theme.breakpoints.sm}px) {
		padding-left: ${(props) => props.theme.spacing[2]}px;
		padding-right: ${(props) => props.theme.spacing[2]}px;
	}
`

export default Nav
