import { Chip } from '@material-tailwind/react'
import { Badge } from 'react-bootstrap'
import styled from 'styled-components'

interface BadgeProps {
	children: any
	color?: string
}

export const StyledBadge: React.FC<BadgeProps> = ({ children, color }) => {
	return <Chip className={`mt-2 px-2 py-1 text-base font-medium bg-primary-200`} style={{ backgroundColor: `${color} !important` }} value={children} />
}

export const PriceBadge = styled(Badge)`
	font-size: 1em;
	background: ${props => props.theme.color.transparent[100]};
	color: ${props => props.theme.color.text[100]};
`

export const FeeBadge = styled(Badge)`
	font-size: 0.875em !important;
	line-height: 1rem !important;
	background-color: ${props => props.theme.color.green} !important;
	color: ${props => props.theme.color.text[100]} !important;
`

export const CompositionBadge = styled(Badge)`
	font-size: 1em;
	color: ${props => props.theme.color.text[100]};
	font-weight: ${props => props.theme.fontWeight.medium};
	background-color: ${props => props.theme.color.primary[300]} !important;
`

export const StatBadge = styled(Badge)`
	font-size: 1em;
	color: ${props => props.theme.color.text[100]};
	font-weight: ${props => props.theme.fontWeight.medium};
	background-color: ${props => props.theme.color.primary[200]} !important;
`

export const AssetBadge = styled(Badge)`
	&.bg-primary {
		background-color: ${(props: any) => props.color} !important;
		color: #fff8ee !important;
	}

	margin: 8px 0;
`
