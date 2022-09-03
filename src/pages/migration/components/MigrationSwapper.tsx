import Config from '@/bao/lib/config'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import Image from 'next/future/image'
import React, { useState } from 'react'
import { isDesktop } from 'react-device-detect'
import MigrationButton from './MigrationButton'

const MigrationSwapper: React.FC = () => {
	const [inputVal, setInputVal] = useState('')

	const baov1Balance = useTokenBalance(Config.addressMap.BAO)

	return (
		<>
			<PageHeader title='Migration' />
			<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
				Migrate your BAOv1 to BAOv2!
			</Typography>
			<Card className={`${isDesktop && 'mx-auto max-w-[80%]'}`}>
				<Card.Header
					header={
						<Tooltipped content='Migrate your BAOv1 to BAOv2!'>
							<a>
								<FontAwesomeIcon className='text-4xl' icon={faSync} />
							</a>
						</Tooltipped>
					}
				/>
				<Card.Body>
					<Typography variant='sm' className='float-left mb-1'>
						Balance: {getDisplayBalance(baov1Balance).toString()} BAOv1
					</Typography>
					<Input
						onSelectMax={() => setInputVal(decimate(baov1Balance).toString())}
						onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
						value={inputVal}
						label={
							<div className='flex flex-row items-center pl-2 pr-4'>
								<div className='flex w-6 justify-center'>
									<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
								</div>
							</div>
						}
					/>
					<Input
						onSelectMax={null}
						onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
						disabled={true}
						value={inputVal && new BigNumber(inputVal).times(0.001).toString()}
						label={
							<div className='flex flex-row items-center pl-2 pr-4'>
								<div className='flex w-6 justify-center'>
									<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
								</div>
							</div>
						}
					/>
					<div className='h-4' />
				</Card.Body>
				<Card.Actions>
					<MigrationButton inputVal={inputVal} maxValue={decimate(baov1Balance)} />
				</Card.Actions>
			</Card>
		</>
	)
}

export default MigrationSwapper
