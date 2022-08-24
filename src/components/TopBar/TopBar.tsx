import Button from '@/components/Button'
import { MenuIcon } from '@/components/Icon'
import Logo from '@/components/Logo'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Container from '../Container'
import AccountButton from './components/AccountButton'
import Nav from './components/Nav'

interface TopBarProps {
	isDarkMode: boolean
	toggleTheme: () => void
	onPresentMobileMenu: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onPresentMobileMenu, isDarkMode, toggleTheme }) => {
	return (
		<header className='relative z-50 pb-11 lg:pt-11'>
			<Container className='flex flex-wrap items-center justify-center sm:justify-between lg:flex-nowrap'>
				<div className='mt-10 lg:mt-0 lg:grow lg:basis-0'>
					<Logo />
				</div>
				<div className='order-first -mx-4 flex flex-auto basis-full overflow-x-auto whitespace-nowrap border-b border-primary-300 py-4 text-sm sm:-mx-6 lg:order-none lg:mx-0 lg:basis-auto lg:border-0 lg:py-0'>
					<div className='mx-auto flex items-center gap-4 px-4'>
						<Nav />
					</div>
				</div>
				<div className='hidden sm:mt-10 sm:flex lg:mt-0 lg:grow lg:basis-0 lg:justify-end'>
					<AccountButton />
					<FontAwesomeIcon
						icon={isDarkMode ? faMoon : faSun}
						onClick={toggleTheme}
						className='ml-4 hover:cursor-pointer'
						aria-label='Dark Mode'
					/>
					<Button size='sm' className='ml-4 rounded-lg border-0 bg-primary-200 outline-0 xl:hidden' onClick={onPresentMobileMenu}>
						<MenuIcon />
					</Button>
				</div>
			</Container>
		</header>
	)
}

export default TopBar
