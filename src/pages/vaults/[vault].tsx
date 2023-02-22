import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import VaultListwDash from './components/VaultListwDash'

export async function getStaticPaths() {
	return {
		paths: [{ params: { vault: 'bSTBL' } }, { params: { vault: 'bETH' } }],
		fallback: false, // can also be true or 'blocking'
	}
}

export async function getStaticProps({ params }: { params: { vault: string; name: string } }) {
	const { vault, name } = params

	return {
		props: {
			vaultId: vault,
			vaultName: name,
		},
	}
}

const Vault: NextPage<{
	vaultName: string
}> = ({ vaultName }) => {
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<>
				<VaultListwDash vaultName={vaultName} />
			</>
		</>
	)
}

export default Vault
