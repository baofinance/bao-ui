import React from 'react'
import { isDesktop } from 'react-device-detect'
import { PropagateLoader, PulseLoader, MoonLoader } from 'react-spinners'

interface LoaderProps {
	text?: string
	block?: boolean
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
	return (
		<div className='inline items-center justify-center'>
			<PulseLoader size={6} speedMultiplier={0.8} color={isDesktop ? '#e21a53' : '#faf2e3'} />
			{text && <div className='text-baoWhite'>{text}</div>}
		</div>
	)
}

export default Loader

export const PageLoader: React.FC<LoaderProps> = ({ block, text }) => {
	return (
		<div className='mt-16 items-center justify-center text-center'>
			<PropagateLoader size={12} speedMultiplier={0.8} color={isDesktop ? '#e21a53' : '#faf2e3'} className={`${block && 'm-auto block'}`} />
			{text && <div className='text-baoWhite'>{text}</div>}
		</div>
	)
}

export const PendingTransaction: React.FC<LoaderProps> = ({ text }) => {
	return <MoonLoader size={16} speedMultiplier={0.8} color={isDesktop ? '#e21a53' : '#faf2e3'} className='mr-2 mt-1 align-middle' />
}
