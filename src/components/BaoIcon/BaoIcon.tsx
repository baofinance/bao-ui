import baoIcon from 'assets/img/tokens/BAO.png'
import React from 'react'

interface BaoIconProps {
	size?: number
	v1?: boolean
	v2?: boolean
	v3?: boolean
}

const BaoIcon: React.FC<BaoIconProps> = ({ size = 36, v1, v2, v3 }) => (
	<span
		role='img'
		style={{
			fontSize: size,
			filter: v1 ? 'saturate(0.5)' : undefined,
		}}
	>
		<img src={baoIcon} width={50} height={50} alt='' />
	</span>
)

export default BaoIcon
