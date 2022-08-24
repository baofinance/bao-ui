import Button from '@/components/Button'
import Container from '@/components/Container'
import Logo from '@/components/Logo'
import NavLinks from '@/components/NavLinks'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Popover } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { FC, ReactNode } from 'react'
import { Url } from 'url'
import { IconProps } from '../Icon'
import AccountButton from '../TopBar/components/AccountButton'
import Nav from '../TopBar/components/Nav'

const MenuIcon: FC<IconProps> = ({ size = 24, ...props }) => {
	return (
		<svg viewBox='0 0 24 24' fill='none' aria-hidden='true' {...props}>
			<path d='M5 6h14M5 18h14M5 12h14' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	)
}

const ChevronUpIcon: FC<IconProps> = ({ size = 24, ...props }) => {
	return (
		<svg viewBox='0 0 24 24' fill='none' aria-hidden='true' {...props}>
			<path d='M17 14l-5-5-5 5' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	)
}

export interface MobileNavLinkProps {
	href: string
	children?: ReactNode
}

const MobileNavLink: FC<MobileNavLinkProps> = ({ href, children, ...props }) => {
	return (
		<Popover.Button as={Link} href={href} className='block text-base leading-7 tracking-tight text-gray-700' {...props}>
			{children}
		</Popover.Button>
	)
}

interface HeaderProps {
	isDarkMode: boolean
	toggleTheme: () => void
	onPresentMobileMenu: () => void
}

const Header: FC<HeaderProps> = ({ onPresentMobileMenu, isDarkMode, toggleTheme }) => {
	return (
		<header>
			<nav>
				<Container className='relative z-50 flex justify-between py-8'>
					<div className='relative z-10 flex items-center'>
						<Link href='/' aria-label='Home'>
							<Logo />
						</Link>
						<div className='hidden lg:flex lg:gap-10'>
							<Nav />
						</div>
					</div>
					<div className='flex items-center gap-6'>
						<Popover className='lg:hidden'>
							{({ open }) => (
								<>
									<Popover.Button
										className='relative z-10 -m-2 inline-flex items-center rounded-lg stroke-gray-900 p-2 hover:bg-gray-200/50 hover:stroke-gray-600 active:stroke-gray-900 [&:not(:focus-visible)]:focus:outline-none'
										aria-label='Toggle site navigation'
									>
										{({ open }) => (open ? <ChevronUpIcon className='h-6 w-6' /> : <MenuIcon className='h-6 w-6' />)}
									</Popover.Button>
									<AnimatePresence initial={false}>
										{open && (
											<>
												<Popover.Overlay
													static
													as={motion.div}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													className='fixed inset-0 z-0 bg-gray-300/60 backdrop-blur'
												/>
												<Popover.Panel
													static
													as={motion.div}
													initial={{ opacity: 0, y: -32 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{
														opacity: 0,
														y: -32,
														transition: { duration: 0.2 },
													}}
													className='absolute inset-x-0 top-0 z-0 origin-top rounded-b-2xl bg-gray-50 px-6 pb-6 pt-32 shadow-2xl shadow-gray-900/20'
												>
													<div className='space-y-4'>
														<MobileNavLink href='#features'>Features</MobileNavLink>
														<MobileNavLink href='#reviews'>Reviews</MobileNavLink>
														<MobileNavLink href='#pricing'>Pricing</MobileNavLink>
														<MobileNavLink href='#faqs'>FAQs</MobileNavLink>
													</div>
													<div className='mt-8 flex flex-col gap-4'>
														<AccountButton />
														<FontAwesomeIcon
															icon={isDarkMode ? faMoon : faSun}
															onClick={toggleTheme}
															className='ml-4 hover:cursor-pointer'
															aria-label='Dark Mode'
														/>
													</div>
												</Popover.Panel>
											</>
										)}
									</AnimatePresence>
								</>
							)}
						</Popover>
						<AccountButton />
						<FontAwesomeIcon
							icon={isDarkMode ? faMoon : faSun}
							onClick={toggleTheme}
							className='ml-4 hover:cursor-pointer'
							aria-label='Dark Mode'
						/>
					</div>
				</Container>
			</nav>
		</header>
	)
}
export default Header
