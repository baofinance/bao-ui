import { CloseButtonLeft } from '@/components/Button/Button'
import Link from 'next/link'
import React from 'react'
import NavLink from '../NavLink'

interface MobileMenuProps {
	onDismiss: () => void
	visible?: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onDismiss, visible }) => {
	const navigation = [
		{ name: 'Markets', href: '/markets' },
		{ name: 'Ballast', href: '/ballast' },
		{ name: 'Baskets', href: '/baskets' },
		{ name: 'Farms', href: '/farms' },
		{ name: 'NFT', href: '/nft' },
	]

	const externalLinks = [
		{ name: 'Vote', href: 'https://snapshot.page/#/baovotes.eth' },
		{ name: 'Forum', href: 'https://gov.bao.finance' },
		{ name: 'Docs', href: 'https://docs.bao.finance' },
	]

	if (visible) {
		return (
			<div className='flex flex-col fixed top-0 right-0 bottom-0 left-0 z-50'>
				<div className='bg-transparent-100 absolute top-0 right-0 bottom-0 left-0' onClick={onDismiss} />
				<div className='rounded-tl-lg rounded-bl-lg	animate-slide-in bg-primary-100 flex flex-1 flex-col justify-center absolute top-0 bottom-0 left-full w-[calc(100%-48px)] pt-24 pb-24 border-0 overflow-y-scroll text-center'>
					<CloseButtonLeft onClick={onDismiss} onHide={onDismiss} />
					{navigation.map(link => (
						<Link href={link.href} key={link.name}>
							<a className='text-rubik font-medium text-text-100 hover:text-text-400 antialiased text-xl' onClick={onDismiss}>{link.name}</a>
						</Link>
					))}
					{externalLinks.map(link => (
						<a
							href={link.href}
							key={link.name}
							target='_blank'
							rel='noreferrer'
							className='text-rubik font-medium text-text-100 hover:text-text-400 antialiased text-xl'
							onClick={onDismiss}
						>
							{link.name}
						</a>
					))}
				</div>
			</div>
		)
	}
	return null
}

export default MobileMenu
