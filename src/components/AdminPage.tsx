import React, { useState, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'
import styles from './AdminPage.module.css'
import GoldABI from '../abi/GoldABI.json'

const GOLD_Address = '0x68Cd469503384EA977809d898eFae5423C78Dfa2'

const AdminPage = ({ selectedWallet, userAccount }) => {
  const RPC_URL =
    'https://polygon-mainnet.g.alchemy.com/v2/pmUZRjDjzs7tWIVU8AbhC4EHL7Im-WcO'
  const [tokenAddress, setTokenAddress] = useState('')
  const [removeTokenAddress, setRemoveTokenAddress] = useState('')
  const [updateTokenAddress, setUpdateTokenAddress] = useState('')
  const [tokenRate, setTokenRate] = useState('')
  const [newTokenRate, setNewTokenRate] = useState('')
  const [buyTax, setBuyTax] = useState('')
  const [recoverTokenAddress, setRecoverTokenAddress] = useState('')
  const [recoverTokenAmount, setRecoverTokenAmount] = useState('')

  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), [RPC_URL])

  // Создаем контракт с провайдером для чтения данных
  const contract = useMemo(
    () => new ethers.Contract(GOLD_Address, GoldABI, provider),
    [provider]
  )

  // Функция для получения signer из выбранного кошелька
  const getSignerContract = async () => {
    const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
    const signer = await web3Provider.getSigner()
    return new ethers.Contract(GOLD_Address, GoldABI, signer)
  }

  const handleAddWhitelistedToken = async () => {
    if (!userAccount || !selectedWallet) return
    try {
      const signerContract = await getSignerContract()
      const tx = await signerContract.addWhitelistedToken(
        tokenAddress,
        ethers.parseUnits(tokenRate, 18)
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
        ethers.parseUnits(newTokenRate, 18)
      )
      await tx.wait()
      setNewTokenRate('')
      setUpdateTokenAddress('')
      alert('Token rate updated')
    } catch (error) {
      setNewTokenRate('')
      setTokenAddress('')
      console.error(error)
      alert('Failed to update token rate')
    }
  }

  const handleSetBuyTax = async () => {
    if (!userAccount || !selectedWallet) return
    try {
      const signerContract = await getSignerContract()
      const tx = await signerContract.setBuyTax(buyTax)
      await tx.wait()
      alert('Buy tax set')
      setBuyTax('')
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
          <div className={styles.inputGroup}>
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
          <h2>Set Buy Tax</h2>
          <div className={styles.inputGroup}>
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
          <h2>Recover ERC20 Tokens</h2>
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
      </div>
    </div>
  )
}

export default AdminPage
