import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Logo: React.FC = () => {
	return (
		<Link href='/'>
			<a>
				<div className='flex items-center justify-center m-0 min-h-60 min-w-60 p-0 '>
					<Image src={`/images/icons/icon-72.png`} width={32} height={32} className='align-middle' />
					<span className='w-fit whitespace-nowrap text-text-100 font-kaushan text-xl tracking-wide xl:display-hidden font-medium  ml-2'>
						Bao Finance
					</span>
				</div>
			</a>
		</Link>
	)
}

export default Logo
