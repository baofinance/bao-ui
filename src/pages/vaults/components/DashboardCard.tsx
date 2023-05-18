import { ActiveSupportedVault } from '@/bao/lib/types'
import Card from '@/components/Card/Card'
import Loader from '@/components/Loader'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { BasketInfo } from '@/hooks/baskets/useBasketInfo'
import { BasketRates } from '@/hooks/baskets/useBasketRate'
import { BasketComponent } from '@/hooks/baskets/useComposition'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useBorrowBalances } from '@/hooks/vaults/useBalances'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { Group } from '@visx/group'
import Pie from '@visx/shape/lib/shapes/Pie'
import { Text } from '@visx/text'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'

type DashboardCardProps = {
	title?: string
	asset: ActiveSupportedVault
	amount?: string
	vaultName: string
	mintVal: string
	depositVal: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({ asset, amount, vaultName, mintVal, depositVal }: DashboardCardProps) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const borrowBalances = useBorrowBalances(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)

	const borrowed = useMemo(
		() => asset && borrowBalances && borrowBalances.find(balance => balance.address === asset.vaultAddress).balance,
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
				Dashboard
			</Typography>
			<Card className='glassmorphic-card p-6'>
				<Card.Body>
					<div className='grid w-full grid-cols-12 px-4 pt-2'>
						<div className='col-span-4'>
							<div className='grid h-full grid-rows-2'>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Collateral
									</Typography>
									<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
										$
										{`${
											bao && account && accountLiquidity
												? getDisplayBalance(decimate(BigNumber.from(accountLiquidity.usdSupply.toString())), 18, 2)
												: 0
										}`}
									</Typography>
								</div>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Debt
									</Typography>
									<div>
										<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
											${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}
										</Typography>
									</div>
									<Typography className='m-auto inline-block align-middle font-bakbak text-baoRed'>
										{borrowed ? getDisplayBalance(borrowed) : 0}{' '}
									</Typography>
									<Image
										className='z-10 m-auto ml-1 inline-block select-none align-middle'
										src={asset && `/images/tokens/${asset.underlyingSymbol}.png`}
										alt={asset && asset.underlyingSymbol}
										width={16}
										height={16}
									/>
								</div>
							</div>
						</div>
						<div className='col-span-4'>
							<div className='grid h-full grid-rows-2'>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Debt Limit Remaining
									</Typography>
									<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
										${getDisplayBalance(accountLiquidity ? accountLiquidity.usdBorrowable.sub(change) : BigNumber.from(0))}
									</Typography>
								</div>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Debt Limit Used
									</Typography>
									<div>
										<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
											{getDisplayBalance(!newBorrowable.eq(0) ? newBorrow.div(newBorrowable).mul(100) : 0, 18, 2)}%
										</Typography>
									</div>
								</div>
							</div>
						</div>
						<div className='col-span-4 float-right m-auto mr-0 w-[15vh]'>
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
									<div className=' relative left-1/2 h-[130px] w-[130px] -translate-x-1/2 rounded-full'>
										<div
											className='absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center rounded-full p-1'
											style={{ marginTop: '10px' }}
										>
											<Typography variant='xs' className='font-bakbak text-baoWhite'>
												Debt Health
											</Typography>
											<Typography variant='sm' className='font-bakbak text-baoWhite'>
												{healthFactor &&
													(healthFactor.lte(BigNumber.from(0))
														? '-'
														: healthFactor.gt(parseUnits('10000'))
														? '∞'
														: getDisplayBalance(healthFactor))}
											</Typography>
										</div>
									</div>
								</div>
							</CircularProgressbarWithChildren>
						</div>
					</div>
				</Card.Body>
			</Card>
		</>
	)
}

export default DashboardCard
