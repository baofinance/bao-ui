import React, { Fragment } from 'react'
import {
	HeaderWrapper,
	ItemContainer,
	ItemWrapper,
	MarketTable,
	MarketTableContainer,
	TableHeader,
} from 'views/Markets/components/styles'

type Column = {
	header: any
	value: any
}

type TableProps = {
	columns: Column[]
	items: any[]
	onClick?: (e: any) => void
}

export const Table = ({ columns, items, onClick }: TableProps) => (
	<MarketTable>
		<TableHeader>
			{columns.map(({ header }: Column, i) => (
				<Fragment key={i}>{header}</Fragment>
			))}
		</TableHeader>
		{items?.map((item, i) => (
			<ItemContainer
				key={i}
				onClick={onClick ? (e: React.MouseEvent<HTMLElement>) => onClick(item) : undefined}
			>
				{columns.map(({ value }, j) => (
					<Fragment key={j}>{value(item, i)}</Fragment>
				))}
			</ItemContainer>
		))}
	</MarketTable>
)

export default Table
