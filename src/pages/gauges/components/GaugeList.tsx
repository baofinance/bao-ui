import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useGaugeInfo from '@/hooks/vebao/useGaugeInfo'
import useGauges from '@/hooks/vebao/useGauges'
import useGaugeTVL from '@/hooks/vebao/useGaugeTVL'
import useGaugeWeight from '@/hooks/vebao/useGaugeWeight'
import useMintable from '@/hooks/vebao/useMintable'
import useTotalWeight from '@/hooks/vebao/useTotalWeight'
import GraphUtil from '@/utils/graph'
import { fromDecimal, getDisplayBalance } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useState } from 'react'
import { isDesktop } from 'react-device-detect'
import GaugeModal from './Modals'

const GaugeList: React.FC = () => {
	const gauges = useGauges()

	return (
		<>
			<div className='flex w-full flex-row'>
				<div className='flex w-full flex-col'>
					{isDesktop ? (
						<GaugeListHeader headers={['Gauge', 'Gauge Weight', 'TVL', 'APY']} />
					) : (
						<GaugeListHeader headers={['Gauge', 'Gauge Weight', 'APY']} />
					)}
					{gauges.length ? (
						gauges.map((gauge: any, i: number) => (
							<React.Fragment key={i}>
								<GaugeListItem gauge={gauge} />
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

type GaugeListHeaderProps = {
	headers: string[]
}

const GaugeListHeader: React.FC<GaugeListHeaderProps> = ({ headers }: GaugeListHeaderProps) => {
	return (
		<div className='flex flex-row px-2 py-3'>
			{headers.map((header: string) => (
				<Typography variant='lg' className='flex w-full flex-col px-2 pb-0 text-right font-bold first:text-left' key={header}>
					{header}
				</Typography>
			))}
		</div>
	)
}

interface GaugeListItemProps {
	gauge: ActiveSupportedGauge
}

const GaugeListItem: React.FC<GaugeListItemProps> = ({ gauge }) => {
	const { chainId, account } = useWeb3React()
	const [showGaugeModal, setShowGaugeModal] = useState(false)

	const weight = useGaugeWeight(gauge.gaugeAddress)
	const totalWeight = useTotalWeight()

	// Messy but works for now
	const relativeWeight = BigNumber.from(100)
		.pow(18)
		.mul(weight)
		.div(totalWeight.eq(0) ? 1 : totalWeight)
		.mul(100)

	const { data: baoPrice } = useQuery(
		['GraphUtil.getPriceFromPair', { WETH: true, BAO: true }],
		async () => {
			const wethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
			const _baoPrice = await GraphUtil.getPriceFromPair(wethPrice, Config.contracts.Bao[chainId].address)
			return fromDecimal(_baoPrice)
		},
		{
			enabled: !!chainId,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			placeholderData: BigNumber.from(0),
		},
	)

	const gaugeInfo = useGaugeInfo(gauge)
	const mintable = useMintable()
	const gaugeTVL = useGaugeTVL(gauge)

	console.log('Mintable Rewards', formatUnits(mintable))
	console.log('Bao Price', formatUnits(baoPrice.mul(1000)))
	console.log('Rewards Value', formatUnits(mintable.mul(baoPrice)))
	// console.log('Gauge Weight', weight.toString())
	// console.log('Total Weight', totalWeight.toString())
	// console.log('Relative Weight', relativeWeight.toString())
	// console.log('Gauge Name', gauge.name)
	// console.log('Working Balances', gaugeInfo?.workingSupply.toString())
	// console.log('Mintable', formatUnits(mintable))

	return (
		<>
			<button className='w-full py-2' onClick={() => setShowGaugeModal(true)} disabled={!account}>
				<div className='rounded border border-primary-300 bg-primary-100 p-4 hover:bg-primary-200'>
					<div className='flex w-full flex-row items-center'>
						<div className={`mx-auto my-0 flex ${isDesktop ? 'basis-1/4' : 'basis-1/2'} flex-col text-left`}>
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
										{gauge.type === 'Curve LP' ? (
											<Image src='/images/tokens/CRV.png' height={12} width={12} alt='Curve' className='mr-1 inline' />
										) : (
											<Image src='/images/tokens/UNI.png' height={12} width={12} alt='Uniswap' className='mr-1 inline' />
										)}
										{gauge.type}
									</Typography>
								</span>
							</div>
						</div>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
							<Typography variant='base' className='ml-2 inline-block font-medium'>
								{getDisplayBalance(relativeWeight, 18, 2)}%
							</Typography>
						</div>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
							<Typography variant='base' className='ml-2 inline-block font-medium'>
								${gaugeTVL && getDisplayBalance(formatUnits(gaugeTVL))}
							</Typography>
						</div>
						{isDesktop && (
							<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
								<Typography variant='base' className='ml-2 inline-block font-medium'>
									<Typography variant='base' className='ml-2 inline-block font-medium'>
										{gaugeTVL && gaugeTVL.gt(0) ? baoPrice.mul(mintable).div(gaugeTVL).mul(100).toString() : 0}%
									</Typography>
								</Typography>
							</div>
						)}
					</div>
				</div>
			</button>
			<GaugeModal gauge={gauge} show={showGaugeModal} onHide={() => setShowGaugeModal(false)} />
		</>
	)
}

export default GaugeList
