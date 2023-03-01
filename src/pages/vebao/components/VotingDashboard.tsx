import { ActiveSupportedGauge } from '@/bao/lib/types'
import Button from '@/components/Button'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import usePrice from '@/hooks/base/usePrice'
import useGauges from '@/hooks/gauges/useGauges'
import useGaugeTVL from '@/hooks/gauges/useGaugeTVL'
import useMintable from '@/hooks/gauges/useMintable'
import useRelativeWeight from '@/hooks/gauges/useRelativeWeight'
import useVotingPowerAllocated from '@/hooks/gauges/useVotingPowerAllocated'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useUserSlopes from '@/hooks/vebao/useUserSlopes'
import CountdownTimer from '@/pages/gauges/components/CountdownTimer'
import { getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import Image from 'next/future/image'
import Slider from 'rc-slider'
import React, { useCallback, useState } from 'react'
import { isDesktop } from 'react-device-detect'

const VotingList: React.FC = () => {
	const gauges = useGauges()

	return (
		<>
			<div className='flex w-full flex-row'>
				<div className='flex w-full flex-col'>
					<div className='flex w-full flex-row items-center'>
						<div className={`mx-auto my-0 flex basis-[20%] flex-col text-center`}>
							<Typography variant='xs' className='flex w-full flex-col px-2 pb-0 text-left text-text-200'>
								Gauge Name
							</Typography>
						</div>
						<div className={`mx-auto my-0 flex basis-[40%] flex-col text-center `}>
							<Typography variant='xs' className='flex w-full flex-col px-2 pb-0 text-center text-text-200'>
								{' '}
							</Typography>
						</div>
						<div className={`mx-auto my-0 flex basis-[10%] flex-col text-left`}>
							<Typography variant='xs' className='flex w-full flex-col px-2 pb-0 text-right text-text-200'>
								Current Weight
							</Typography>
						</div>
						<div className={`mx-auto my-0 flex basis-[10%] flex-col text-left`}>
							<Typography variant='xs' className='flex w-full flex-col px-2 pb-0 text-right text-text-200'>
								Current APR
							</Typography>
						</div>
						<div className={`mx-auto my-0 flex basis-[10%] flex-col text-left`}>
							<Typography variant='xs' className='flex w-full flex-col px-2 pb-0 text-right text-text-200'>
								Projected Weight
							</Typography>
						</div>
						<div className={`mx-auto my-0 flex basis-[10%] flex-col text-left`}>
							<Typography variant='xs' className='flex w-full flex-col px-2 pb-0 text-right text-text-200'>
								Projected APR
							</Typography>
						</div>
					</div>
					{gauges.length ? (
						gauges.map((gauge: any, i: number) => (
							<React.Fragment key={i}>
								<VotingListItem gauge={gauge} />
							</React.Fragment>
						))
					) : (
						<PageLoader block />
					)}
				</div>
			</div>
		</>
	)
}

interface VotingListItemProps {
	gauge: ActiveSupportedGauge
}

const VotingListItem: React.FC<VotingListItemProps> = ({ gauge }) => {
	const { account } = useWeb3React()
	const [showGaugeModal, setShowGaugeModal] = useState(false)
	const { currentWeight, futureWeight } = useRelativeWeight(gauge.gaugeAddress)
	const baoPrice = usePrice('bao-finance-v2')

	const mintable = useMintable()
	const { gaugeTVL } = useGaugeTVL(gauge)
	const rewardsValue = baoPrice ? baoPrice.mul(mintable) : BigNumber.from(0)
	const rewardsAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(currentWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)

	const lockInfo = useLockInfo()
	const votingPowerAllocated = useVotingPowerAllocated()
	const userSlopes = useUserSlopes(gauge)
	const [val, setVal] = useState<string | number>(
		userSlopes && BigNumber.from(userSlopes.power) !== BigNumber.from(0) ? userSlopes.power.div(100).toString() : '0',
	)

	const currentAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(currentWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)
	const futureAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(futureWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const onSliderChange = (value: number | number[]) => {
		setVal(value as number)
	}

	return (
		<>
			<div className='p-2'>
				<div className='flex w-full flex-row items-center'>
					<div className={`mx-auto my-0 flex basis-[20%] flex-col text-left`}>
						<div className='mx-0 my-auto inline-block h-full items-center'>
							<div className='mr-2 inline-block'>
								<Image className='z-10 inline-block select-none' src={gauge.iconA} alt={gauge.symbol} width={32} height={32} />
								<Image className='z-20 -ml-2 inline-block select-none' src={gauge.iconB} alt={gauge.symbol} width={32} height={32} />
							</div>
							<span className='inline-block text-left align-middle'>
								<Typography variant='base' className='font-bold'>
									{gauge.name}
								</Typography>
								<Typography variant='sm' className={`font-light text-text-200`}>
									{gauge.type.toLowerCase() === 'curve' ? (
										<Image src='/images/tokens/CRV.png' height={12} width={12} alt='Curve' className='mr-1 inline' />
									) : (
										<Image src='/images/tokens/UNI.png' height={12} width={12} alt='Uniswap' className='mr-1 inline' />
									)}
									{gauge.type}
								</Typography>
							</span>
						</div>
					</div>
					<div className={`mx-auto my-0 flex basis-[40%] flex-col text-left`}>
						<div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary-100'>
							<Slider
								max={
									(userSlopes && userSlopes.power.div(100).eq(100)) || (userSlopes && userSlopes.power.eq(0) && votingPowerAllocated.eq(0))
										? 100
										: userSlopes && votingPowerAllocated.div(100).eq(100) && userSlopes.power.eq(0)
										? 0
										: userSlopes && votingPowerAllocated.div(100).sub(userSlopes.power.div(100)).toNumber()
								}
								value={BigNumber.from(val).toNumber()}
								onChange={onSliderChange}
								handleStyle={{
									backgroundColor: '#FFD84B',
									borderColor: '#FFD84B',
									boxShadow: 'none',
									opacity: 1,
								}}
								trackStyle={{
									backgroundColor: '#CC9902',
									borderColor: '#CC9902',
								}}
								railStyle={{
									backgroundColor: '#622a2a',
								}}
							/>

							<input
								type='number'
								id='points'
								disabled={true}
								onChange={handleChange}
								placeholder={val.toString()}
								value={val}
								min={0}
								max={
									userSlopes && userSlopes.power.div(100) === BigNumber.from(100)
										? BigNumber.from(100).toString()
										: userSlopes && votingPowerAllocated.div(100).sub(userSlopes.power.div(100)).toString()
								}
								className='relative -mr-2 h-6 w-10 min-w-0
				appearance-none rounded border-solid border-inherit border-primary-500 bg-primary-100 text-end 
				align-middle outline-none outline outline-2 outline-offset-2 transition-all
				 duration-200 disabled:text-text-100'
							/>
							<Typography variant='base' className='m-0 mr-2 rounded border-solid border-inherit border-primary-500 bg-primary-100 p-0'>
								%
							</Typography>
							<Button size='xs'>Vote</Button>
						</div>
					</div>
					<div className='mx-auto my-0 flex basis-[10%] flex-col text-right'>
						<Typography variant='base' className='ml-2 inline-block'>
							{getDisplayBalance(currentWeight.mul(100), 18, 2)}%
						</Typography>
					</div>
					<div className='mx-auto my-0 flex basis-[10%] flex-col text-right'>
						<Typography variant='base' className='ml-2 inline-block'>
							{getDisplayBalance(futureWeight.mul(100), 18, 2)}%
						</Typography>
					</div>
					{isDesktop && (
						<>
							<div className='mx-auto my-0 flex basis-[10%] flex-col text-right'>
								<Typography variant='base' className='ml-2 inline-block'>
									{getDisplayBalance(currentAPR)}%
								</Typography>
							</div>
							<div className='mx-auto my-0 flex basis-[10%] flex-col text-right'>
								<Typography variant='base' className='ml-2 inline-block'>
									{getDisplayBalance(futureAPR)}%
								</Typography>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	)
}

const VotingDashboard: React.FC = () => {
	const votingPowerAllocated = useVotingPowerAllocated()

	return (
		<div>
			<Typography variant='xl' className='mt-4 font-bold'>
				Voting Dashboard
			</Typography>
			<div className='my-2 rounded border border-primary-300 bg-primary-100 bg-opacity-80 p-4'>
				<div className={`grid w-full grid-flow-col ${isDesktop ? 'grid-rows-1 gap-4' : 'grid-rows-3 gap-2'} justify-evenly`}>
					<div className='items-center justify-center text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-text-200'>
								Voting Period Ends
							</Typography>
						</div>
						<div className='text-lg font-bold'>
							<CountdownTimer />
						</div>
					</div>
					<div className='items-center justify-center text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-text-200'>
								Your Voting Power Allocated
							</Typography>
						</div>
						<Typography variant='lg' className='font-bold'>
							{getDisplayBalance(votingPowerAllocated)}%
						</Typography>
					</div>
				</div>
				<VotingList />
			</div>
		</div>
	)
}

export default VotingDashboard
