import Badge from '@/components/Badge'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { useVaultPrices } from '@/hooks/vaults/usePrices'
import { useAccountVaults, useVaults } from '@/hooks/vaults/useVaults'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import { useMemo } from 'react'
import DepositCard from './components/DepositCard'
import MintCard from './components/MintCard'
import Positions from './components/Positions'

export async function getStaticPaths() {
	return {
		paths: [{ params: { vault: 'baoUSD' } }, { params: { vault: 'baoETH' } }],
		fallback: false, // can also be true or 'blocking'
	}
}

export async function getStaticProps({ params }: { params: any }) {
	const { vault } = params

	return {
		props: {
			vaultName: vault,
		},
	}
}

const Vault: NextPage<{
	vaultName: string
}> = ({ vaultName }) => {
	const _vaults = useVaults(vaultName)
	const accountBalances = useAccountBalances(vaultName)
	const accountVaults = useAccountVaults(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)
	const supplyBalances = useSupplyBalances(vaultName)
	const borrowBalances = useBorrowBalances(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)
	const balances = useAccountBalances(vaultName)
	const { prices } = useVaultPrices(vaultName)

	const collateral = useMemo(() => {
		if (!(_vaults && supplyBalances)) return
		return _vaults
			.filter(vault => !vault.isSynth)
			.sort((a, b) => {
				void a
				return supplyBalances.find(balance => balance.address.toLowerCase() === b.vaultAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [_vaults, supplyBalances])

	const synth = useMemo(() => {
		if (!_vaults) return
		return _vaults.find(vault => vault.isSynth)
	}, [_vaults])

	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<>
				{collateral && synth && accountBalances && accountLiquidity && accountVaults && supplyBalances && exchangeRates ? (
					<>
						<div className='bg-primary-100 mb-4 flex w-full flex-row items-center gap-4 rounded border-0 p-4 align-middle'>
							<Link href='/vaults'>
								<div className='glassmorphic-card my-4 flex h-fit w-fit flex-row items-center gap-4 rounded border-0 p-3 align-middle duration-200 hover:bg-baoRed'>
									<FontAwesomeIcon icon={faArrowLeft} />
								</div>
							</Link>
							<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
								<Image
									src={`/images/tokens/${synth.icon}`}
									alt={`${synth.underlyingSymbol}`}
									width={40}
									height={40}
									className='inline-block select-none'
								/>
								<span className='inline-block text-left align-middle'>
									<Typography variant='h2' className='ml-2 font-bakbak leading-5'>
										{synth.underlyingSymbol}
									</Typography>
								</span>
							</div>
							<div className='mx-auto my-0 flex w-full flex-row items-center justify-end text-end align-middle'>
								<Badge className='rounded-full bg-baoRed align-middle'>
									<Typography className='ml-2 inline-block font-bold leading-5'>{getDisplayBalance(synth.borrowApy)}%</Typography>
									<Typography className='ml-1 inline-block font-bold leading-5 text-baoWhite'>APY</Typography>
								</Badge>
							</div>
						</div>
						<div className='grid w-full grid-cols-6 gap-16 rounded-lg'>
							<div className='col-span-3'>
								<DepositCard
									vaultName={vaultName}
									balances={balances}
									supplyBalances={supplyBalances}
									collateral={collateral}
									exchangeRates={exchangeRates}
									accountBalances={accountBalances}
								/>
							</div>

							<div className='col-span-3'>
								<MintCard vaultName={vaultName} prices={prices} accountLiquidity={accountLiquidity} synth={synth} collateral={collateral} />
							</div>
						</div>
						<div className='grid w-full grid-cols-6 gap-16 rounded-lg'>
							<div className='col-span-3'>
								<Positions
									vaultName={vaultName}
									balances={balances}
									supplyBalances={supplyBalances}
									collateral={collateral}
									exchangeRates={exchangeRates}
									accountBalances={accountBalances}
									accountVaults={accountVaults}
									borrowBalances={borrowBalances}
								/>
							</div>

							<div className='col-span-3'></div>
						</div>
					</>
				) : (
					<PageLoader block />
				)}
			</>
		</>
	)
}

export default Vault
