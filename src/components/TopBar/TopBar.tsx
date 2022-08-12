import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MenuIcon } from 'components/Icon'
import Logo from 'components/Logo'
import React from 'react'
import styled from 'styled-components'
import { Button } from '../Button'
import AccountButton from './components/AccountButton'
import Nav from './components/Nav'

interface TopBarProps {
	isDarkMode: boolean
	toggleTheme: () => void
	onPresentMobileMenu: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onPresentMobileMenu, isDarkMode, toggleTheme }) => {
	return (
		<StyledTopBar>
			<StyledTopBarInner>
				<StyledLogoWrapper>
					<Logo />
				</StyledLogoWrapper>
				<StyledNavWrapper>
					<Nav />
				</StyledNavWrapper>
				<StyledAccountButtonWrapper>
					<AccountButton />
					<StyledThemeButton>
						<Button onClick={toggleTheme} aria-label='Dark Mode'>
							<FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
						</Button>
					</StyledThemeButton>
					<StyledMenuButton onClick={onPresentMobileMenu}>
						<MenuIcon />
					</StyledMenuButton>
				</StyledAccountButtonWrapper>
			</StyledTopBarInner>
		</StyledTopBar>
	)
}

const StyledLogoWrapper = styled.div`
	width: 200px;
	@media (max-width: ${props => props.theme.breakpoints.xl}px) {
		width: auto;
	}
`
const StyledTopBar = styled.div`
	margin: auto;
	border-bottom: ${props => props.theme.border.default};
	width: 100%;
	position: fixed;
	z-index: 999999;
	background: ${props => props.theme.color.background[100]};
`

const StyledNavWrapper = styled.div`
	display: flex;
	flex: 1;
	justify-content: center;
	@media (max-width: ${props => props.theme.breakpoints.xl}px) {
		display: none;
	}
`

const StyledTopBarInner = styled.div`
	background: ${props => props.theme.color.background[100]};
	margin: auto;
	align-items: center;
	display: flex;
	height: ${props => props.theme.topBarSize}px;
	justify-content: space-between;
	width: 98%;
	z-index: 999999;
`

const StyledAccountButtonWrapper = styled.div`
	align-items: center;
	display: flex;
	justify-content: flex-end;
	width: 200px;
	@media (max-width: ${props => props.theme.breakpoints.sm}px) {
		justify-content: center;
		width: auto;
	}
`

const StyledMenuButton = styled.button`
	background: none;
	border: 0;
	margin: 0;
	outline: 0;
	padding: 0;
	display: none;

	@media (max-width: ${props => props.theme.breakpoints.xl}px) {
		align-items: center;
		display: flex;
		height: 44px;
		justify-content: center;
		width: 44px;
		margin-left: ${props => props.theme.spacing[2]}px;
	}
`

const StyledThemeButton = styled.div`
	> button {
		height: 40px;
		width: 40px;
		margin-left: 1rem;
	}
`

export default TopBar
