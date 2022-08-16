import { Button } from '@/components/Button'
import { MenuIcon } from '@/components/Icon'
import Logo from '@/components/Logo'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styled from 'styled-components'
import AccountButton from './components/AccountButton'
import Nav from './components/Nav'

interface TopBarProps {
	isDarkMode: boolean
	toggleTheme: () => void
	onPresentMobileMenu: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onPresentMobileMenu, isDarkMode, toggleTheme }) => {
	return (
		<div className='fixed z-50 m-auto w-full border-b border-primary-300 bg-background-100'>
			<div className='z-50 m-auto flex h-20 w-full items-center justify-between p-4'>
				<div className='w-auto'>
					<Logo />
				</div>
				<div className='hidden flex-1 justify-center xl:flex'>
					<Nav />
				</div>
				<div className='flex w-[200px] items-center justify-end sm:w-auto sm:justify-center'>
					<AccountButton />
					<Button onClick={toggleTheme} size='sm' aria-label='Dark Mode' className='ml-4'>
						<FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
					</Button>
					<Button size='sm' className='ml-4 rounded-lg border-0 bg-primary-200 outline-0 xl:hidden' onClick={onPresentMobileMenu}>
						<MenuIcon />
					</Button>
				</div>
			</div>
		</div>
	)
}

export default TopBar
