import fs from 'fs'
import { MerkleTree } from 'merkletreejs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import chalk from 'chalk'

// -------------------------------
// MERKLE ROOT GENERATION
// -------------------------------

type Account = {
	address: string
	amount: string
}

const _keccakAbiEncode = (a: string, n: string): string => ethers.utils.keccak256(ethers.utils.solidityPack(['address', 'uint256'], [a, n]))

const snapshot: Account[] = JSON.parse(fs.readFileSync(`./public/snapshot.json`).toString())

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const { address } = req.query

	const leaves = snapshot.map(account => _keccakAbiEncode(account.address, account.amount))
	const tree = new MerkleTree(leaves, ethers.utils.keccak256, { sort: true })
	const root = tree.getRoot().toString('hex')
	console.log(`${chalk.greenBright('Merkle Root:')} 0x${root}`)
	console.log('-------------------------------------------------------------------------------')

	const account = snapshot.find(item => {
		return item.address.toLowerCase() === (address as string).toLowerCase()
	})
	if (!account) {
		res.status(404).json({
			error: {
				code: 404,
				message: 'Account not found in merkle proofs snapshot.',
			},
		})
	}

	const leaf = _keccakAbiEncode(account.address, account.amount)
	const proof = tree.getHexProof(leaf)
	if (tree.verify(proof, leaf, root)) {
		res.status(200).json({
			proof,
			...account,
		})
	} else {
		res.status(404).json({
			error: {
				code: 404,
				message: 'Invalid merkle proof.',
			},
		})
	}
}
