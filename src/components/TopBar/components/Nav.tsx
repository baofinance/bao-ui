import NavLink from '@/components/NavLink'
import Link from 'next/link'
import React from 'react'

const Nav: React.FC = () => {
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

	return (
		<nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' aria-label='Top'>
			<div className='w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none'>
				<div className='flex items-center'>
					<div className='hidden ml-10 space-x-8 lg:block'>
						{navigation.map(link => (
							<NavLink href={link.href} key={link.name}>
								{link.name}
							</NavLink>
						))}
						{externalLinks.map(link => (
							<Link href={link.href} key={link.name} target='_blank' rel='noreferrer'>
								<a className='text-rubik font-medium text-text-100 hover:text-text-400 antialiased'>{link.name}</a>
							</Link>
						))}
					</div>
				</div>
			</div>
			<div className='py-4 flex flex-wrap justify-center space-x-6 lg:hidden'>
				{navigation.map(link => (
					<NavLink href={link.href} key={link.name}>
						{link.name}
					</NavLink>
				))}
				{externalLinks.map(link => (
					<Link href={link.href} key={link.name} target='_blank' rel='noreferrer'>
						<a className='text-rubik font-medium text-text-100 hover:text-text-300 antialiased'>{link.name}</a>
					</Link>
				))}
			</div>
		</nav>
	)
}

export default Nav
