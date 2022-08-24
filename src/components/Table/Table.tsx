import { FC } from "react"

type TableHeaderProps = {
	headers: string[]
}

export const TableHeader: FC<TableHeaderProps> = ({ headers }: TableHeaderProps) => {
	return (
		<thead>
			<tr>
				{headers.map((header: string) => (
					<th className='p-2 text-right first:text-left' key={header}>
						{header}
					</th>
				))}
			</tr>
		</thead>
	)
}
