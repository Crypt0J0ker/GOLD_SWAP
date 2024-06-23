import React, { useState, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'
import styles from './AdminPage_sep.module.css'
import GoldABI from '../abi/GoldTestABI.json'

import config from './config/config.js'

interface Network {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
  contracts: {
    ROCK_ADDRESS: string
    GOLD_ADDRESS: string
    SWORD_ADDRESS: string
  }
}

interface AdminPageProps {
  selectedWallet: EIP6963ProviderDetail
  userAccount: string
}

const AdminPageSep: React.FC<AdminPageProps> = ({
  selectedWallet,
  userAccount,
}) => {
  const [tokenAddress, setTokenAddress] = useState('')
  const [removeTokenAddress, setRemoveTokenAddress] = useState('')
  const [updateTokenAddress, setUpdateTokenAddress] = useState('')
  const [tokenRate, setTokenRate] = useState('')
  const [newTokenRate, setNewTokenRate] = useState('')
  const [buyTax, setBuyTax] = useState('')
  const [recoverTokenAddress, setRecoverTokenAddress] = useState('')
  const [recoverTokenAmount, setRecoverTokenAmount] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [tax, setTax] = useState(0)

  const getNetworkConfig = selectedWallet => {
    if (!selectedWallet || !selectedWallet.info || !selectedWallet.provider)
      return null

    let chainId
    try {
      chainId =
        selectedWallet.provider.chainId ||
        selectedWallet.provider._network.chainId
      console.log('chainId', chainId)
    } catch (error) {
      console.error('Error retrieving chainId:', error)
      return null
    }

    const network: Network | undefined = (
      Object.values(config.networks) as Network[]
    ).find(network => network.chainId === chainId)

    return network ? network : null
  }

  const networkConfig = getNetworkConfig(selectedWallet)
  const RPC_URL = networkConfig ? networkConfig.rpcUrls[0] : null
  const { GOLD_ADDRESS = '' } = networkConfig ? networkConfig.contracts : {}

  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), [RPC_URL])

  const contract = useMemo(
    () => new ethers.Contract(GOLD_ADDRESS, GoldABI, provider),
    [provider]
  )

  useEffect(() => {
    if (!userAccount || !selectedWallet) return
    const checkRoles = async () => {
      try {
        const owner = await contract.owner()
        setIsOwner(owner.toLowerCase() === userAccount.toLowerCase())
        console.log('userAccount', userAccount)
        console.log('owner ', isOwner)
        const adminRole =
          '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'
        const normalizedUserAccount = ethers.getAddress(userAccount)
        const isAdminResult = await contract.hasRole(
          adminRole,
          normalizedUserAccount
        )
        setIsAdmin(isAdminResult)
        console.log('admin ', isAdmin)
      } catch (error) {
        console.error('Error checking roles:', error)
      }
    }

    const handleUpdateBuyTax = async () => {
      try {
        const ratio = await contract.buyTax()
        setTax(Number(ratio))
        console.log(ratio)
      } catch (error) {
        console.error('Error getting ratio:', error)
      }
    }

    checkRoles()
    handleUpdateBuyTax()
  }, [selectedWallet, userAccount, contract])

  const handleUpdateBuyTax = async () => {
    try {
      const tax = await contract.buyTax()
      setTax(Number(tax))
    } catch (error) {
      console.error('Error getting ratio:', error)
    }
  }

  const getSignerContract = async () => {
    const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
    const signer = await web3Provider.getSigner()
    return new ethers.Contract(GOLD_ADDRESS, GoldABI, signer)
  }

  const handleAddWhitelistedToken = async () => {
    if (!userAccount || !selectedWallet) return
    try {
      const signerContract = await getSignerContract()
      const tx = await signerContract.addWhitelistedToken(
        tokenAddress,
        tokenRate
      )
      await tx.wait()
      setTokenAddress('')
      setTokenRate('')
      alert('Token added to whitelist')
    } catch (error) {
      setTokenAddress('')
      setTokenRate('')
      console.error(error)
      alert('Failed to add token')
    }
  }

  const handleRemoveWhitelistedToken = async () => {
    if (!userAccount || !selectedWallet) return
    try {
      const signerContract = await getSignerContract()
      const tx = await signerContract.removeWhitelistedToken(removeTokenAddress)
      await tx.wait()
      setRemoveTokenAddress('')
      alert('Token removed from whitelist')
    } catch (error) {
      console.error(error)
      alert('Failed to remove token')
    }
  }

  const handleUpdateWhitelistedTokenRate = async () => {
    if (!userAccount || !selectedWallet) return
    try {
      const signerContract = await getSignerContract()
      const tx = await signerContract.updateWhitelistedTokenRate(
        updateTokenAddress,
        newTokenRate
      )
      await tx.wait()
      setNewTokenRate('')
      setUpdateTokenAddress('')
      alert('Token tax updated')
    } catch (error) {
      setNewTokenRate('')
      setTokenAddress('')
      console.error(error)
      alert('Failed to update token tax')
    }
  }

  const handleSetBuyTax = async () => {
    if (!userAccount || !selectedWallet) return
    try {
      const signerContract = await getSignerContract()
      const tx = await signerContract.setBuyTax(buyTax)
      await tx.wait()
      setBuyTax('')
      handleUpdateBuyTax()
      alert('Buy tax set')
    } catch (error) {
      setBuyTax('')
      console.error(error)
      alert('Failed to set buy tax')
    }
  }

  const handleRecoverERC20 = async () => {
    if (!userAccount || !selectedWallet) return
    try {
      const signerContract = await getSignerContract()
      const tx = await signerContract.recoverERC20(
        recoverTokenAddress,
        ethers.parseUnits(recoverTokenAmount, 18)
      )
      await tx.wait()
      setRecoverTokenAddress('')
      setRecoverTokenAmount('')
      alert('Tokens recovered')
    } catch (error) {
      setRecoverTokenAddress('')
      setRecoverTokenAmount('')
      console.error(error)
      alert('Failed to recover tokens')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.section}>
          <h2>Add Whitelisted Token</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Token Address"
              value={tokenAddress}
              onChange={e => setTokenAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Rate"
              value={tokenRate}
              onChange={e => setTokenRate(e.target.value)}
            />
          </div>
          <button className={styles.button} onClick={handleAddWhitelistedToken}>
            Add Token
          </button>
        </div>

        <div className={styles.section}>
          <h2>Remove Whitelisted Token</h2>
          <div className={styles.inputGroup} style={{ marginBottom: '58px' }}>
            <input
              type="text"
              placeholder="Token Address"
              value={removeTokenAddress}
              onChange={e => setRemoveTokenAddress(e.target.value)}
            />
          </div>
          <button
            className={styles.button}
            onClick={handleRemoveWhitelistedToken}
          >
            Remove Token
          </button>
        </div>

        <div className={styles.section}>
          <h2>Update Whitelisted Token Rate</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Token Address"
              value={updateTokenAddress}
              onChange={e => setUpdateTokenAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="New Rate"
              value={newTokenRate}
              onChange={e => setNewTokenRate(e.target.value)}
            />
          </div>
          <button
            className={styles.button}
            onClick={handleUpdateWhitelistedTokenRate}
          >
            Update Rate
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.tax}>
            <h2>Set Buy Tax</h2>
            <p>Current tax: {tax}</p>
          </div>
          <div className={styles.inputGroup} style={{ marginBottom: '58px' }}>
            <input
              type="text"
              placeholder="New Buy Tax"
              value={buyTax}
              onChange={e => setBuyTax(e.target.value)}
            />
          </div>
          <button className={styles.button} onClick={handleSetBuyTax}>
            Set Buy Tax
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.tax}>
            <h2>Recover ERC20 Tokens</h2>
            <p>Only Owner</p>
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Token Address"
              value={recoverTokenAddress}
              onChange={e => setRecoverTokenAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Token Amount"
              value={recoverTokenAmount}
              onChange={e => setRecoverTokenAmount(e.target.value)}
            />
          </div>
          <button className={styles.button} onClick={handleRecoverERC20}>
            Recover Tokens
          </button>
        </div>
        {!isAdmin && (
          <div className={styles.attention}>
            <p>
              Attention: You will not be able to modify the smart contract
              because you are not an admin!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPageSep
