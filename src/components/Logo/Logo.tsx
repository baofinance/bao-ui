import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Logo: React.FC = () => {
	return (
		<Link href='/'>
			<a>
				<div className='m-0 flex items-center justify-center p-0 '>
					<Image src={`/images/icons/icon-72.png`} width={32} height={32} className='align-middle' alt='Bao' />
				</div>
			</a>
		</Link>
	)
}

export default Logo
