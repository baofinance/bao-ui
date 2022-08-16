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
			<div className='fixed top-0 right-0 bottom-0 left-0 z-50 flex flex-col'>
				<div className='absolute top-0 right-0 bottom-0 left-0 bg-transparent-100' onClick={onDismiss} />
				<div className='absolute top-0	bottom-0 left-full flex w-[calc(100%-48px)] flex-1 animate-slide-in flex-col justify-center overflow-y-scroll rounded-tl-lg rounded-bl-lg border-0 bg-primary-100 pt-24 pb-24 text-center'>
					<CloseButtonLeft onClick={onDismiss} onHide={onDismiss} />
					{navigation.map(link => (
						<Link href={link.href} key={link.name}>
							<a className='text-rubik text-xl font-medium text-text-100 antialiased hover:text-text-400' onClick={onDismiss}>
								{link.name}
							</a>
						</Link>
					))}
					{externalLinks.map(link => (
						<a
							href={link.href}
							key={link.name}
							target='_blank'
							rel='noreferrer'
							className='text-rubik text-xl font-medium text-text-100 antialiased hover:text-text-400'
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
