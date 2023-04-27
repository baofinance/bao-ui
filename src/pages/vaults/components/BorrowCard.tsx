import { ActiveSupportedVault } from '@/bao/lib/types'
import Card from '@/components/Card/Card'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useBorrowBalances } from '@/hooks/vaults/useBalances'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useMemo } from 'react'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import Image from 'next/future/image'

type BorrowCardProps = {
	title?: string
	asset: ActiveSupportedVault
	amount?: string
	vaultName: string
	mintVal: string
	depositVal: string
}

const BorrowCard: React.FC<BorrowCardProps> = ({ asset, amount, vaultName, mintVal, depositVal }: BorrowCardProps) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const borrowBalances = useBorrowBalances(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)

	const borrowed = useMemo(
		() => asset && borrowBalances.find(balance => balance.address === asset.vaultAddress).balance,
		[borrowBalances, asset],
	)

	const change = mintVal && depositVal ? BigNumber.from(mintVal).sub(BigNumber.from(depositVal)) : BigNumber.from(0)
	const borrow = accountLiquidity ? accountLiquidity.usdBorrow : BigNumber.from(0)
	const newBorrow = borrow ? borrow.sub(change.gt(0) ? change : 0) : BigNumber.from(0)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(exponentiate(accountLiquidity.usdBorrowable)) : BigNumber.from(0)
	const newBorrowable = asset && decimate(borrowable).sub(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))

	const borrowChange = borrow.add(exponentiate(change))
	const healthFactor = useHealthFactor(vaultName, borrowChange)

	const healthFactorColor = (healthFactor: BigNumber) => {
		const c = healthFactor.eq(0)
			? `${(props: any) => props.theme.color.text[100]}`
			: healthFactor.lte(parseUnits('1.25'))
			? '#e32222'
			: healthFactor.lt(parseUnits('1.55'))
			? '#ffdf19'
			: '#45be31'
		return c
	}

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Your Debt
			</Typography>
			<Card className='glassmorphic-card p-4'>
				<Card.Body>
					<div className='grid grid-cols-12'>
						<div className='col-span-4'>
							<Typography variant='h3' className='font-bakbak text-baoWhite'>
								{borrowed ? getDisplayBalance(borrowed) : 0}
								<Image
									className='z-10 ml-1 inline-block select-none'
									src={asset && `/images/tokens/${asset.underlyingSymbol}.png`}
									alt={asset && asset.underlyingSymbol}
									width={24}
									height={24}
								/>
							</Typography>
							<Typography>${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}</Typography>
						</div>
						<div className='col-span-4'>Sector 2</div>
						<div className='col-span-4'>
							<div className='float-right m-auto w-[13.33vh]'>
								<CircularProgressbarWithChildren
									value={parseFloat(
										getDisplayBalance(
											accountLiquidity && newBorrowable && !newBorrowable.eq(0)
												? (parseFloat(accountLiquidity.usdBorrow.toString()) / parseFloat(newBorrowable.toString())) * 100
												: 0,
											18,
											2,
										),
									)}
									strokeWidth={10}
									styles={buildStyles({
										strokeLinecap: 'butt',
										pathColor: `${healthFactor ? healthFactorColor(healthFactor) : '#fff'}`,
									})}
								>
									<div className='max-w-[16.6666666667%] basis-[16.6666666667%]'>
										<div className='bg-primary-100 relative left-1/2 h-[130px] w-[130px] -translate-x-1/2 rounded-full'>
											<div
												className='absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center rounded-full p-1'
												style={{ marginTop: '10px' }}
											>
												<Typography variant='xs' className='font-medium text-baoWhite'>
													Debt Limit
												</Typography>
												<Typography variant='sm' className='font-bold text-baoWhite'>
													{getDisplayBalance(
														accountLiquidity && newBorrowable && !newBorrowable.eq(0)
															? accountLiquidity.usdBorrow.div(newBorrowable).mul(100)
															: 0,
														18,
														0,
													)}
													{'%'}
												</Typography>
											</div>
										</div>
									</div>
								</CircularProgressbarWithChildren>
							</div>
						</div>
					</div>
					<StatBlock
						label=''
						stats={[
							{
								label: 'Your Collateral USD',
								value: `$${
									bao && account && accountLiquidity
										? getDisplayBalance(decimate(BigNumber.from(accountLiquidity.usdSupply.toString())), 18, 2)
										: 0
								}`,
							},
							{
								label: 'Your Debt',
								value: `${borrowed ? getDisplayBalance(borrowed) : 0} ${asset && asset.underlyingSymbol}`,
							},
							{
								label: 'Your Debt USD',
								value: `$${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}`,
							},
							{
								label: 'Debt Limit Remaining',
								value: `$${getDisplayBalance(accountLiquidity ? accountLiquidity.usdBorrowable : BigNumber.from(0))} ➜ $${getDisplayBalance(
									accountLiquidity ? accountLiquidity.usdBorrowable.sub(change) : BigNumber.from(0),
								)}`,
							},
							{
								// FIXME: Fix this for when a users current borrow amount is zero
								label: 'Debt Limit Used',
								value: `${getDisplayBalance(
									!borrowable.eq(0) ? exponentiate(borrow).div(borrowable).mul(100) : 0,
									18,
									2,
								)}% ➜ ${getDisplayBalance(!newBorrowable.eq(0) ? newBorrow.div(newBorrowable).mul(100) : 0, 18, 2)}%`,
							},
							{
								label: `Debt Health`,
								value: `${
									healthFactor &&
									(healthFactor.lte(BigNumber.from(0)) ? '-' : healthFactor.gt(parseUnits('10000')) ? '∞' : getDisplayBalance(healthFactor))
								}`,
							},
						]}
					/>
				</Card.Body>
			</Card>
		</>
	)
}

export default BorrowCard
