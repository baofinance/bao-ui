import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { ListHeader } from '@/components/List'
import { PageLoader } from '@/components/Loader'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import { AccountLiquidity, useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { Balance, useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { useVaultPrices } from '@/hooks/vaults/usePrices'
import { useAccountVaults, useVaults } from '@/hooks/vaults/useVaults'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react/components/Accordion'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import DepositCard from './components/DepositCard'
import MintCard from './components/MintCard'
import VaultSupplyModal from './components/Modals/SupplyModal'
import { VaultDetails } from './components/Stats'

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
						<Link href='/vaults'>
							<div className='glassmorphic-card mb-4 mt-6 flex h-fit w-fit flex-row gap-4 rounded border-0 p-3 duration-200 hover:bg-baoRed'>
								<FontAwesomeIcon icon={faArrowLeft} />
							</div>
						</Link>
						<div className='bg-primary-100 mb-4 flex w-full flex-row gap-4 rounded border-0 p-4'>
							<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
								<Image
									src={`/images/tokens/${synth.icon}`}
									alt={`${synth.underlyingSymbol}`}
									width={40}
									height={40}
									className='inline-block select-none'
								/>
								<span className='inline-block text-left align-middle'>
									<Typography className='ml-2 font-bakbak text-xl leading-5'>{synth.underlyingSymbol}</Typography>
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
								<MintCard vaultName={vaultName} prices={prices} accountLiquidity={accountLiquidity} synth={synth} />
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

type CollateralListProps = {
	collateral: ActiveSupportedVault[]
	vaultName: string
}

export const CollateralList: React.FC<CollateralListProps> = ({ collateral, vaultName }: CollateralListProps) => {
	const accountBalances = useAccountBalances(vaultName)
	const accountVaults = useAccountVaults(vaultName)
	const supplyBalances = useSupplyBalances(vaultName)
	const borrowBalances = useBorrowBalances(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)

	return (
		<>
			<Typography variant='lg' className='text-center font-bold'>
				Collateral
			</Typography>
			<ListHeader headers={['Asset', 'Wallet', 'Underlying APY', 'Liquidity']} className='mr-10' />
			{collateral.map((vault: ActiveSupportedVault) => (
				<CollateralItem
					vault={vault}
					vaultName={vaultName}
					accountBalances={accountBalances}
					accountVaults={accountVaults}
					supplyBalances={supplyBalances}
					borrowBalances={borrowBalances}
					exchangeRates={exchangeRates}
					key={vault.vaultAddress}
				/>
			))}
		</>
	)
}

const CollateralItem: React.FC<CollateralItemProps> = ({
	vault,
	vaultName,
	accountBalances,
	supplyBalances,
	exchangeRates,
}: CollateralItemProps) => {
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const { account } = useWeb3React()

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances.find(balance => balance.address === vault.vaultAddress)
		if (supply === undefined) return BigNumber.from(0)
		if (exchangeRates[vault.vaultAddress] === undefined) return BigNumber.from(0)
		return decimate(supply.balance.mul(exchangeRates[vault.vaultAddress]))
	}, [supplyBalances, exchangeRates, vault.vaultAddress])

	// FIXME: Causes crash
	// const isInVault = useMemo(() => {
	// 	return accountVaults && vault && accountVaults.find(_vault => _vault.vaultAddress === vault.vaultAddress)
	// }, [accountVaults, vault])

	// const [isChecked, setIsChecked] = useState(!!isInVault)

	const [isOpen, setIsOpen] = useState(false)

	const handleOpen = () => {
		!isOpen ? setIsOpen(true) : setIsOpen(false)
		showSupplyModal && setIsOpen(true)
	}

	const baskets = useBaskets()
	const basket =
		vault.isBasket === true && baskets && baskets.find(basket => basket.address.toLowerCase() === vault.underlyingAddress.toLowerCase())

	const composition = useComposition(vault.isBasket === true && basket && basket)
	const avgBasketAPY =
		vault.isBasket && composition
			? (composition
					.sort((a, b) => (a.percentage.lt(b.percentage) ? 1 : -1))
					.map(component => {
						return component.apy
					})
					.reduce(function (a, b) {
						return a + parseFloat(formatUnits(b))
					}, 0) /
					composition.length) *
			  100
			: 0

	return (
		<>
			<Accordion open={isOpen || showSupplyModal} className='my-2 rounded border text-transparent-200'>
				<AccordionHeader
					onClick={handleOpen}
					className={`bg-primary-100 hover:bg-primary-200 rounded border-0 p-2 ${isOpen && 'bg-primary-200 rounded-b-none'}`}
				>
					<div className='flex w-full flex-row items-center justify-center'>
						<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
							<Image
								src={`/images/tokens/${vault.icon}`}
								alt={`${vault.underlyingSymbol}`}
								width={24}
								height={24}
								className='inline-block select-none'
							/>
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-medium leading-5'>{vault.underlyingSymbol}</Typography>
							</span>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography className='ml-2 font-medium leading-5'>
								{account
									? getDisplayBalance(
											accountBalances.find(balance => balance.address === vault.underlyingAddress).balance,
											vault.underlyingDecimals,
									  )
									: '-'}
							</Typography>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography className='ml-2 font-medium leading-5'>
								{vault.isBasket && avgBasketAPY ? getDisplayBalance(avgBasketAPY, 0, 2) + '%' : '-'}
							</Typography>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>
									{`$${getDisplayBalance(decimate(vault.supplied.mul(vault.price).sub(vault.totalBorrows.mul(vault.price)), 18))}`}
								</span>
							</Typography>
						</div>
					</div>
				</AccordionHeader>
				<AccordionBody className='bg-primary-100 rounded-b-lg p-3'>
					<StatBlock
						label='Supply Details'
						stats={[
							{
								label: 'Total Supplied',
								value: `${getDisplayBalance(vault.supplied, vault.underlyingDecimals)} ${vault.underlyingSymbol} | $${getDisplayBalance(
									decimate(vault.supplied.mul(vault.price)),
								)}`,
							},
							{
								label: 'Your Supply',
								value: `${getDisplayBalance(suppliedUnderlying, vault.underlyingDecimals)} ${vault.underlyingSymbol} | $${getDisplayBalance(
									decimate(suppliedUnderlying.mul(vault.price)),
								)}`,
							},
							{
								label: 'Wallet Balance',
								value: `${getDisplayBalance(
									accountBalances.find(balance => balance.address === vault.underlyingAddress).balance,
									vault.underlyingDecimals,
								)} ${vault.underlyingSymbol}`,
							},
						]}
					/>
					<div className='mt-4' />
					<VaultDetails asset={vault} title='Vault Details' vaultName={vaultName} />
					<div className={`mt-4 flex ${isDesktop ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
						<div className='flex w-full flex-col'>
							<Button fullWidth onClick={() => setShowSupplyModal(true)} className='!p-2 !text-base'>
								Supply / Withdraw
							</Button>
						</div>
					</div>
				</AccordionBody>
			</Accordion>
			<VaultSupplyModal
				vaultName={vaultName}
				asset={vault}
				show={showSupplyModal}
				onHide={() => {
					setShowSupplyModal(false)
					setIsOpen(true)
				}}
			/>
		</>
	)
}

export default Vault

type CollateralItemProps = {
	vault: ActiveSupportedVault
	vaultName: string
	accountBalances?: Balance[]
	accountVaults?: ActiveSupportedVault[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}
