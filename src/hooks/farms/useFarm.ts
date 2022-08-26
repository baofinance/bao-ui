import { useContext } from 'react'

import { Context as FarmsContext, Farm } from '@/contexts/Farms'

const useFarm = (id: string): Farm => {
	const { farms } = useContext(FarmsContext)
	return farms.find(farm => farm.id === id)
}

export default useFarm
