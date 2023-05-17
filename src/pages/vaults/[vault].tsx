import Badge from '@/components/Badge'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { useVaultPrices } from '@/hooks/vaults/usePrices'
import { useAccountVaults, useVaults } from '@/hooks/vaults/useVaults'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import CollateralList from './components/CollateralList'
import DebtCard from './components/DebtCard'
import DepositCard from './components/DepositCard'
import MintCard from './components/MintCard'

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
	const [depositVal, setDepositVal] = useState('0')
	const [mintVal, setMintVal] = useState('0')

	const handleDepositVal = useCallback(
		(updatedState: any) => {
			// update the parent component's state with the new value
			setDepositVal(updatedState)
		},
		[depositVal],
	)

	const handleMintVal = useCallback(
		(updatedState: any) => {
			// update the parent component's state with the new value
			setMintVal(updatedState)
		},
		[mintVal],
	)

	console.log('depositVal', depositVal)
	console.log('mintVal', mintVal)

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
		if (!(accountVaults && supplyBalances)) return
		return accountVaults
			.filter(vault => !vault.isSynth)
			.sort((a, b) => {
				void a
				return supplyBalances.find(balance => balance.address.toLowerCase() === b.vaultAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [accountVaults, supplyBalances])

	const synth = useMemo(() => {
		if (!_vaults) return
		return _vaults.find(vault => vault.isSynth)
	}, [_vaults])

	const vaultTVLs = collateral && collateral.map(vault => ({ tvl: vault.liquidity.mul(vault.price) }))
	const totalCollateral = useMemo(() => vaultTVLs && vaultTVLs.reduce((acc, curr) => acc.add(curr.tvl), BigNumber.from(0)), [vaultTVLs])
	const totalDebt = synth && synth.totalBorrows.mul(synth.price)

	console.log('accountVaults', accountVaults)
	console.log('accountLiquidity', accountLiquidity.usdSupply)
	console.log('borrowable', accountLiquidity.usdBorrowable)
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<>
				{collateral && synth && accountBalances && accountLiquidity && accountVaults && supplyBalances && exchangeRates ? (
					<>
						<div className='mb-4 flex w-full flex-row items-center gap-4 rounded border-0 align-middle'>
							<Link href='/vaults'>
								<div className='glassmorphic-card flex h-fit w-fit flex-row items-center p-7 align-middle duration-200 hover:bg-baoRed'>
									<FontAwesomeIcon icon={faArrowLeft} size='lg' />
								</div>
							</Link>
							<div className='glassmorphic-card grid w-full grid-cols-4 !px-8 !py-4'>
								<div className='col-span-1 mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
									<Image
										src={`/images/tokens/${synth.icon}`}
										alt={`${synth.underlyingSymbol}`}
										width={40}
										height={40}
										className='inline-block select-none'
									/>
									<span className='inline-block text-left align-middle'>
										<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
											{synth.underlyingSymbol}
										</Typography>
										<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(synth.price)}</Badge>
									</span>
								</div>
								<div className='col-span-3 mx-auto my-0 flex w-full flex-row items-center justify-end align-middle'>
									<div className='grid grid-cols-4 gap-16'>
										<div className='col-span-1 break-words text-center'>
											<Typography variant='base' className='font-bakbak text-baoRed'>
												Total Debt
											</Typography>
											<Typography variant='xl' className='inline-block font-bakbak leading-5'>
												${getDisplayBalance(decimate(totalDebt), synth.underlyingDecimals)}
											</Typography>
										</div>
										<div className='col-span-1 break-words text-center'>
											<Typography variant='base' className='font-bakbak text-baoRed'>
												Total Collateral
											</Typography>
											<Typography variant='xl' className='inline-block font-bakbak leading-5'>
												${getDisplayBalance(decimate(totalCollateral), synth.underlyingDecimals)}
											</Typography>
										</div>
										<div className='col-span-1 break-words text-center'>
											<Typography variant='base' className='font-bakbak text-baoRed'>
												Utilization
											</Typography>
											<Typography variant='xl' className='inline-block font-bakbak leading-5'>
												{getDisplayBalance(totalDebt.div(decimate(totalCollateral)).mul(100))}%
											</Typography>
										</div>
										<div className='col-span-1 break-words text-center'>
											<Typography variant='base' className='font-bakbak text-baoRed'>
												Borrow Rate
											</Typography>
											<Typography variant='xl' className='inline-block font-bakbak leading-5'>
												{getDisplayBalance(synth.borrowApy)}%
											</Typography>
											<Typography className='ml-1 inline-block font-bakbak leading-5 text-baoWhite'>vAPY</Typography>
										</div>
									</div>
								</div>
							</div>
						</div>

						{accountVaults.length >= 1 && !accountLiquidity.usdSupply.lte(0) && !accountLiquidity.usdBorrowable.lte(0) && (
							<div className='grid grid-cols-2 gap-16'>
								<div className='col-span-1'>
									<CollateralList
										vaultName={vaultName}
										supplyBalances={supplyBalances}
										collateral={collateral}
										exchangeRates={exchangeRates}
										accountBalances={accountBalances}
										accountVaults={accountVaults}
										borrowBalances={borrowBalances}
									/>
								</div>
								<div className='col-span-1'>
									<DebtCard vaultName={vaultName} asset={synth} depositVal={depositVal} mintVal={mintVal} />
								</div>
							</div>
						)}

						<div className='grid grid-cols-2 gap-16'>
							<div className='col-span-1'>
								<DepositCard
									vaultName={vaultName}
									balances={balances}
									supplyBalances={supplyBalances}
									collateral={collateral}
									exchangeRates={exchangeRates}
									accountBalances={accountBalances}
									onUpdate={handleDepositVal}
								/>
							</div>
							<div className='col-span-1'>
								<MintCard
									vaultName={vaultName}
									prices={prices}
									accountLiquidity={accountLiquidity}
									synth={synth}
									collateral={collateral}
									onUpdate={handleMintVal}
								/>
							</div>
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
