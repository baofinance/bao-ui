import Container from '@/components/Container'
import Logo from '@/components/Logo'
import { faDiscord, faGithub, faMedium, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faBolt, faBook, faBug, faEllipsisVertical, faVoteYea } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu, Popover, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { FC, Fragment, ReactNode } from 'react'
import { isDesktop } from 'react-device-detect'
import AccountButton from '../AccountButton'
import Button from '../Button'
import Nav from '../Nav'

export interface IconProps {
	color?: string
	children?: ReactNode
	size?: number
	className?: string
}

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

const Header: FC = () => {
	return (
		<header className='fixed top-0 z-50 w-full border-b border-b-primary-300 bg-background-100'>
			<nav>
				<Container className='relative z-50 flex max-w-full justify-between py-4'>
					<div className='relative z-10 flex items-center gap-8'>
						<Logo />
						{isDesktop && (
							<div className='flex gap-8'>
								<Nav />
							</div>
						)}
					</div>
					<div className='flex items-center gap-2'>
						{!isDesktop && (
							<Popover>
								{({ open }) => (
									<>
										<Popover.Button
											className='relative z-10 -mr-2 inline-flex items-center rounded stroke-text-100 p-2 outline-none hover:bg-primary-100/50 [&:not(:focus-visible)]:focus:outline-none'
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
															<MobileNavLink href='/'>Markets</MobileNavLink>
															<MobileNavLink href='/ballast'>Ballast</MobileNavLink>
															<MobileNavLink href='/baskets'>Baskets</MobileNavLink>
															<MobileNavLink href='/farms'>Farms</MobileNavLink>
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
						<Menu as='div' className='relative inline-block text-left'>
							<div>
								<Menu.Button className='flex items-center rounded'>
									<Button size='sm' className='bg-primary-100 hover:bg-primary-300'>
										<span className='sr-only'>Open options</span>
										<FontAwesomeIcon icon={faEllipsisVertical} className='h-5 w-5' aria-hidden='true' />
									</Button>
								</Menu.Button>
							</div>

							<Transition
								as={Fragment}
								enter='transition ease-out duration-100'
								enterFrom='transform opacity-0 scale-95'
								enterTo='transform opacity-100 scale-100'
								leave='transition ease-in duration-75'
								leaveFrom='transform opacity-100 scale-100'
								leaveTo='transform opacity-0 scale-95'
							>
								<Menu.Items className='absolute right-0 z-10 mt-2 w-fit origin-top-right rounded-md border border-primary-300 bg-background-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
									<div className='py-1'>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://docs.bao.finance'
													aria-label='Documentation'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Documentation <FontAwesomeIcon icon={faBook} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://gov.bao.finance'
													aria-label='Governance Forums'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Governance <FontAwesomeIcon icon={faVoteYea} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://snapshot.org/#/baovotes.eth/'
													aria-label='Snapshot'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Snapshot <FontAwesomeIcon icon={faBolt} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://discord.gg/BW3P62vJXT'
													aria-label='Discord'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Discord <FontAwesomeIcon icon={faDiscord} className='text-end' />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://github.com/baofinance'
													aria-label='GitHub'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													GitHub <FontAwesomeIcon icon={faGithub} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://www.immunefi.com/bounty/baofinance'
													aria-label='Immunefi'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Immunefi <FontAwesomeIcon icon={faBug} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://twitter.com/BaoCommunity'
													aria-label='Twitter'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Twitter <FontAwesomeIcon icon={faTwitter} />
												</a>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<a
													target='_blank'
													href='https://medium.com/baomunity'
													aria-label='Medium'
													rel='noreferrer'
													className={classNames(
														active ? 'bg-primary-100 text-text-400' : 'text-text-100',
														'flex flex-1 flex-row items-center justify-between gap-4 px-4 py-2 text-sm',
													)}
												>
													Medium <FontAwesomeIcon icon={faMedium} />
												</a>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
					</div>
				</Container>
			</nav>
		</header>
	)
}
export default Header
