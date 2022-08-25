import Container from '@/components/Container'
import Logo from '@/components/Logo'
import { Popover } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { FC, ReactNode } from 'react'
import { isDesktop } from 'react-device-detect'
import AccountButton from '../AccountButton'
import { IconProps } from '../Icon'
import Nav from '../Nav'

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
	target?: string
	children?: ReactNode
}

const MobileNavLink: FC<MobileNavLinkProps> = ({ href, children, target, ...props }) => {
	return (
		<Popover.Button as={Link} href={href} target={target} className='block text-base leading-7 tracking-tight text-text-100' {...props}>
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
		<header className='bg-background-100 border-b border-b-primary-300 fixed w-full top-0 z-50'>
			<nav>
				<Container className='relative z-50 flex justify-between py-4 max-w-full'>
					<div className='relative z-10 flex items-center gap-8'>
						<Link href='/' aria-label='Home'>
							<Logo />
						</Link>
						{isDesktop && (
							<div className='flex gap-8'>
								<Nav />
							</div>
						)}
					</div>
					<div className='flex items-center gap-6'>
						{!isDesktop && (
							<Popover>
								{({ open }) => (
									<>
										<Popover.Button
											className='relative z-10 -mr-2 inline-flex items-center rounded-lg stroke-text-100 p-2 hover:bg-primary-100/50 outline-none [&:not(:focus-visible)]:focus:outline-none'
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
														className='fixed inset-0 z-0 bg-background-100/60 backdrop-blur'
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
														className='absolute inset-x-0 top-0 z-0 origin-top rounded-b-2xl bg-background-100 px-6 pb-6 pt-32 shadow-2xl shadow-gray-900/20'
													>
														<div className='space-y-4'>
															<MobileNavLink href='/markets'>Markets</MobileNavLink>
															<MobileNavLink href='/ballast'>Ballast</MobileNavLink>
															<MobileNavLink href='/baskets'>Baskets</MobileNavLink>
															<MobileNavLink href='/farms'>Farms</MobileNavLink>
															<MobileNavLink href='/nft'>NFT</MobileNavLink>
															<MobileNavLink href='https://snapshot.page/#/baovotes.eth' target='_blank'>
																Vote
															</MobileNavLink>
															<MobileNavLink href='https://gov.bao.finance/' target='_blank'>
																Forum
															</MobileNavLink>
															<MobileNavLink href='https://docs.bao.finance/' target='_blank'>
																Docs
															</MobileNavLink>
														</div>
													</Popover.Panel>
												</>
											)}
										</AnimatePresence>
									</>
								)}
							</Popover>
						)}
						<AccountButton />
					</div>
				</Container>
			</nav>
		</header>
	)
}
export default Header
