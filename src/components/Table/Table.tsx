import React, { Fragment } from 'react'
import { HeaderWrapper, ItemContainer, ItemWrapper, TableHeader } from 'views/Markets/components/styles'

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
    <TableHeader>
        <HeaderWrapper>
            {columns.map(({ header }: Column, i) => (
                <Fragment key={i}>{header}</Fragment>
            ))}
        </HeaderWrapper>
        <ItemContainer>
            {items?.map((item, i) => (
                <ItemWrapper
                    key={i}
                    onClick={onClick ? (e: React.MouseEvent<HTMLElement>) => onClick(item) : undefined}
                >
                    {columns.map(({ value }, j) => (
                        <Fragment key={j}>{value(item, i)}</Fragment>
                    ))}
                </ItemWrapper>
            ))}
        </ItemContainer>
    </TableHeader>
)

export default Table
