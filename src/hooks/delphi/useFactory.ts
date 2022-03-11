import { useEffect, useState } from 'react'
import GraphUtil from '../../utils/graph'
import { OracleFactory } from '../../views/Delphi/types'

const useFactory = (search?: string) => {
  const [factory, setFactory] = useState<OracleFactory | undefined>()

  useEffect(() => {
    GraphUtil.getDelphiFactoryInfo(search).then((res) => {
      setFactory(res)
    })
  }, [search])

  return factory as OracleFactory
}

export default useFactory
