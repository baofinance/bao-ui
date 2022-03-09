import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import appleStock from '@visx/mock-data/lib/mocks/appleStock'
import { scaleLinear, scaleTime } from '@visx/scale'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { defaultStyles, TooltipWithBounds, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { curveMonotoneX } from '@visx/visx'
import BigNumber from 'bignumber.js'
import { bisector, extent, max, min } from 'd3-array'
import React, { useCallback, useMemo } from 'react'
import { getDisplayBalance } from 'utils/numberFormat'

export type TimeseriesData = {
	high?: number
	low?: number
	open?: number
	close: number
	date: string
}

type TooltipData = TimeseriesData

export const accentColor = '#555'
const tooltipStyles = {
	...defaultStyles,
	background: accentColor,
	border: accentColor,
	color: 'white',
}

// util
const formatDate = (date: any) => {
	const options = {
		month: 'short',
		year: 'numeric',
		day: '2-digit',
	}

	return new Date(date).toLocaleDateString('en-US', options)
}

// accessors
const getDate = (d: TimeseriesData) => new Date(d.date)
const getValue = (d: TimeseriesData) => d.close
const bisectDate = bisector<TimeseriesData, Date>(
	(d: any) => new Date(d.date),
).left

export type AreaProps = {
	width: number
	height: number
	timeseries?: Array<TimeseriesData>
	timeframe?: string
	margin?: { top: number; right: number; bottom: number; left: number }
}

export default withTooltip<AreaProps, TooltipData>(
	({
		width,
		height,
		timeseries = appleStock.map((day) => ({
			date: day.date,
			high: day.close + (Math.random() * (day.close / 10)),
			low: day.close - (Math.random() * (day.close / 10)),
			close: day.close,
			open: day.close,
		})).slice(0, 90),
		timeframe,
		margin = { top: 0, right: 0, bottom: 0, left: 0 },
		showTooltip,
		hideTooltip,
		tooltipData,
		tooltipTop = 0,
		tooltipLeft = 0,
	}: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
		if (width < 10) return null

		// bounds
		const innerWidth = width - margin.left - margin.right
		const innerHeight = height - margin.top - margin.bottom

		const timeSeries = useMemo(() => {
			return timeseries.slice(
				timeframe === 'W' ? -7 : timeframe === 'M' ? -31 : -365,
			)
		}, [timeseries, timeframe])

		// scales
		const dateScale = useMemo(
			() =>
				scaleTime({
					range: [margin.left, innerWidth + margin.left],
					domain: extent(timeSeries, getDate) as [Date, Date],
				}),
			[innerWidth, margin.left, timeSeries],
		)
		const valueScale = useMemo(
			() =>
				scaleLinear({
					range: [innerHeight + margin.top, 0],
					domain: [
						min(timeSeries, (d) => d.low) || 0,
						max(timeSeries, (d) => d.high) || 0,
					],
					nice: true,
				}),
			[margin.top, innerHeight, timeSeries],
		)

		// tooltip handler
		const handleTooltip = useCallback(
			(
				event:
					| React.TouchEvent<SVGRectElement>
					| React.MouseEvent<SVGRectElement>,
			) => {
				const { x, y } = localPoint(event) || { x: 0, y: 0 }
				const x0 = dateScale.invert(x)
				const index = bisectDate(timeSeries, x0, 1)
				const d0 = timeSeries[index - 1]
				const d1 = timeSeries[index]
				let d = d0
				if (d1 && getDate(d1)) {
					d =
						x0.valueOf() - getDate(d0).valueOf() >
						getDate(d1).valueOf() - x0.valueOf()
							? d1
							: d0
				}
				showTooltip({
					tooltipData: d,
					tooltipLeft: dateScale(getDate(d)),
					tooltipTop: y,
				})
			},
			[showTooltip, valueScale, dateScale],
		)

		return (
			<div>
				<svg width={width} height={height}>
					<rect
						x={0}
						y={0}
						width={width}
						height={height}
						fill={'transparent'}
						rx={14}
					/>
					<LinearGradient
						id="line-gradient"
						from={'#f48d33'}
						to={'#ce6509'}
						toOpacity={0.8}
					/>
					<LinearGradient
						id="area-under-curve-gradient"
						from={'#f48d33'}
						to={'#ce6509'}
						fromOpacity={0.1}
						toOpacity={0.35}
					/>
					<LinePath
						stroke="url(#line-gradient)"
						strokeWidth={2.5}
						data={timeSeries}
						x={(d) => dateScale(getDate(d)) ?? 0}
						y={(d) => valueScale(getValue(d)) ?? 0}
						curve={curveMonotoneX}
					/>
					<AreaClosed<TimeseriesData>
						data={timeSeries}
						x={(d) => dateScale(getDate(d)) ?? 0}
						y={(d) => valueScale(getValue(d)) ?? 0}
						yScale={valueScale}
						strokeWidth={1}
						fill="url(#area-under-curve-gradient)"
						curve={curveMonotoneX}
					/>
					{timeSeries.map((d) => {
						return (
							<>
								{d.high && d.low && (
									<>
										<g>
											<Line
												from={{
													x: dateScale(getDate(d)),
													y: valueScale(getValue(d)),
												}}
												to={{ x: dateScale(getDate(d)), y: valueScale(d.high) }}
												stroke={'#444'}
												strokeWidth={2}
												pointerEvents="none"
												strokeDasharray="5,2"
											/>
											<Line
												from={{
													x: dateScale(getDate(d)),
													y: valueScale(getValue(d)),
												}}
												to={{ x: dateScale(getDate(d)), y: valueScale(d.low) }}
												stroke={'#444'}
												strokeWidth={2}
												pointerEvents="none"
												strokeDasharray="5,2"
											/>
										</g>
										<circle
											key={Math.random()}
											r={3}
											cx={dateScale(getDate(d))}
											cy={valueScale(d.high)}
											fill={'#63bd4c'}
										/>
										<circle
											key={Math.random()}
											r={3}
											cx={dateScale(getDate(d))}
											cy={valueScale(d.low)}
											fill={'#bd4c4c'}
										/>
									</>
								)}
								<circle
									key={Math.random()}
									r={3}
									cx={dateScale(getDate(d))}
									cy={valueScale(getValue(d))}
									fill={'#ffbe18'}
								/>
							</>
						)
					})}
					<Bar
						x={margin.left}
						y={margin.top}
						width={innerWidth}
						height={innerHeight}
						fill="transparent"
						rx={14}
						onTouchStart={handleTooltip}
						onTouchMove={handleTooltip}
						onMouseMove={handleTooltip}
						onMouseLeave={() => hideTooltip()}
					/>
					{tooltipData && (
						<g>
							<Line
								from={{ x: tooltipLeft, y: margin.top }}
								to={{ x: tooltipLeft, y: innerHeight + margin.top }}
								stroke={accentColor}
								strokeWidth={2}
								pointerEvents="none"
								strokeDasharray="5,2"
							/>
						</g>
					)}
				</svg>
				{tooltipData && (
					<div>
						<TooltipWithBounds
							key={Math.random()}
							top={tooltipTop - 12}
							left={tooltipLeft + 12}
							style={tooltipStyles}
						>
							Date: {formatDate(getDate(tooltipData))}
							<br />
							<br />
							High: {getDisplayBalance(new BigNumber(tooltipData.high), 0)}
							<br />
							Low: {getDisplayBalance(new BigNumber(tooltipData.low), 0)}
							<br />
							Open: {getDisplayBalance(new BigNumber(tooltipData.open), 0)}
							<br />
							Close:{' '}
							{getDisplayBalance(new BigNumber(getValue(tooltipData)), 0)}
							<br />
							<br />
							Range: [
							{`${getDisplayBalance(
								new BigNumber(tooltipData.low),
								0,
							)}, ${getDisplayBalance(new BigNumber(tooltipData.high), 0)}`}
							]
						</TooltipWithBounds>
					</div>
				)}
			</div>
		)
	},
)
