import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Input from '@/components/Input'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import { Balance } from '@/hooks/vaults/useBalances'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import VaultButton from './VaultButton'
import Card from '@/components/Card/Card'
import { ListHeader } from '@/components/List'
import Accordion, { AccordionBody, AccordionHeader } from '@material-tailwind/react/components/Accordion'
import { VaultDetails } from './Stats'
import Button from '@/components/Button'
import { isDesktop } from 'react-device-detect'
import VaultSupplyModal from './Modals/SupplyModal'
import { AccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import Tooltipped from '@/components/Tooltipped'

export const Positions = ({
	vaultName,
	collateral,
	balances,
	supplyBalances,
	exchangeRates,
	accountBalances,
	accountVaults,
	borrowBalances,
}: {
	vaultName: string
	balances: Balance[]
	supplyBalances: Balance[]
	collateral: ActiveSupportedVault[]
	exchangeRates: any
	accountBalances: Balance[]
	accountVaults: ActiveSupportedVault[]
	borrowBalances: Balance[]
}) => {
	const { account } = useWeb3React()
	const [val, setVal] = useState<string>('')
	const [selectedOption, setSelectedOption] = useState('ETH')

	const asset =
		collateral &&
		(collateral.length
			? collateral.find(asset => asset.underlyingSymbol === selectedOption)
			: collateral.find(asset => asset.underlyingSymbol === 'ETH'))

	const baskets = useBaskets()
	const basket =
		asset &&
		asset.isBasket === true &&
		baskets &&
		baskets.find(basket => basket.address.toLowerCase() === asset.underlyingAddress.toLowerCase())

	const composition = useComposition(asset && basket && asset.isBasket === true && basket)
	const avgBasketAPY =
		asset && asset.isBasket && composition
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

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances && asset && supplyBalances.find(balance => balance.address === asset.vaultAddress)
		const supplyBalance = supply && supply.balance && (supply.balance === undefined ? BigNumber.from(0) : supply.balance)
		if (exchangeRates && asset && exchangeRates[asset.vaultAddress] === undefined) return BigNumber.from(0)
		return supplyBalance && exchangeRates && decimate(supplyBalance.mul(exchangeRates[asset.vaultAddress]))
	}, [supplyBalances, exchangeRates, asset])

	const max = () => {
		return balances
			? balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
			: BigNumber.from(0)
	}

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Open Positions
			</Typography>
			<ListHeader headers={['Asset', 'Deposit', 'vAPY', '']} className='mx-4 pb-0 text-center text-baoWhite text-opacity-50' />
			{collateral.map((vault: ActiveSupportedVault) => (
				<OpenPosition
					vault={vault}
					vaultName={vaultName}
					accountBalances={accountBalances}
					accountVaults={accountVaults}
					supplyBalances={supplyBalances}
					borrowBalances={borrowBalances}
					exchangeRates={exchangeRates}
					key={vault.vaultAddress}
				/>
			))}{' '}
		</>
	)
}

const OpenPosition: React.FC<OpenPositionProps> = ({
	vault,
	vaultName,
	accountBalances,
	supplyBalances,
	exchangeRates,
}: OpenPositionProps) => {
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
			<div className='glassmorphic-card my-4 p-4'>
				<div className='grid w-full grid-cols-12 items-center justify-center px-2'>
					<div className='items-left col-span-3 m-auto ml-0 text-start align-middle'>
						<Image
							src={`/images/tokens/${vault.icon}`}
							alt={`${vault.underlyingSymbol}`}
							width={24}
							height={24}
							className='inline-block select-none'
						/>
						<span className='inline-block text-left align-middle'>
							<Typography className='ml-2 font-bold leading-5'>{vault.underlyingSymbol}</Typography>
						</span>
					</div>
					<div className='col-span-3 mr-0 items-start'>
						<Tooltipped
							content={`$${getDisplayBalance(decimate(suppliedUnderlying.mul(vault.price)))}`}
							key={vault.underlyingSymbol}
							placement='top'
							className='rounded-full bg-baoRed font-bold'
						>
							<Typography className='text-center leading-5'>
								<span className='align-middle font-bold'>{`${getDisplayBalance(suppliedUnderlying, vault.underlyingDecimals)}`}</span>
							</Typography>
						</Tooltipped>
					</div>
					<div className='col-span-3 m-auto items-center justify-center'>
						<Typography className='font-bold leading-5'>
							{vault.isBasket && avgBasketAPY ? getDisplayBalance(avgBasketAPY, 0, 2) + '%' : '-'}
						</Typography>
					</div>

					<div className='col-span-3 m-auto mr-0 items-end'>
						<Button size='xs'>Withdraw</Button>
					</div>
				</div>
			</div>
		</>
	)
}

export default Positions

type OpenPositionProps = {
	vault: ActiveSupportedVault
	vaultName: string
	accountBalances?: Balance[]
	accountVaults?: ActiveSupportedVault[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}
