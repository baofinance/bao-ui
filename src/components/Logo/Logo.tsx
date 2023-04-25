import Image from 'next/future/image'
import Link from 'next/link'
import React from 'react'

const Logo: React.FC = () => {
	return (
		<Link href='/'>
			<div className='m-0 flex items-center justify-center p-0 '>
				<Image src={`/images/icons/bao-icon.svg`} width={40} height={40} className='icon align-middle' alt='Bao' />
			</div>
		</Link>
	)
}

export default Logo
