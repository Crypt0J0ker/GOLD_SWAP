import React, { useState } from 'react'
import { ethers } from 'ethers'
import styles from './AdminPage.module.css'

const AdminPage = ({ selectedWallet, userAccount }) => {
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenRate, setTokenRate] = useState('')
  const [newTokenRate, setNewTokenRate] = useState('')
  const [buyTax, setBuyTax] = useState('')
  const [recoverTokenAddress, setRecoverTokenAddress] = useState('')
  const [recoverTokenAmount, setRecoverTokenAmount] = useState('')

  const handleAddWhitelistedToken = async () => {
    try {
      const tx = await contract.addWhitelistedToken(
        tokenAddress,
        ethers.parseUnits(tokenRate, 18)
      )
      await tx.wait()
      alert('Token added to whitelist')
    } catch (error) {
      console.error(error)
      alert('Failed to add token')
    }
  }

  const handleRemoveWhitelistedToken = async () => {
    try {
      const tx = await contract.removeWhitelistedToken(tokenAddress)
      await tx.wait()
      alert('Token removed from whitelist')
    } catch (error) {
      console.error(error)
      alert('Failed to remove token')
    }
  }

  const handleUpdateWhitelistedTokenRate = async () => {
    try {
      const tx = await contract.updateWhitelistedTokenRate(
        tokenAddress,
        ethers.parseUnits(newTokenRate, 18)
      )
      await tx.wait()
      alert('Token rate updated')
    } catch (error) {
      console.error(error)
      alert('Failed to update token rate')
    }
  }

  const handleSetBuyTax = async () => {
    try {
      console.log('contract', contract)
      const tx = await contract.setBuyTax(buyTax)
      await tx.wait()
      alert('Buy tax set')
    } catch (error) {
      console.error(error)
      alert('Failed to set buy tax')
    }
  }

  const handleRecoverERC20 = async () => {
    try {
      const tx = await contract.recoverERC20(
        recoverTokenAddress,
        ethers.parseUnits(recoverTokenAmount, 18)
      )
      await tx.wait()
      alert('Tokens recovered')
    } catch (error) {
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
              value={tokenAddress}
              onChange={e => setTokenAddress(e.target.value)}
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
              value={tokenAddress}
              onChange={e => setTokenAddress(e.target.value)}
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

/* 
import React, { useState } from 'react'
import { ethers } from 'ethers'
import GoldABI from '../abi/GoldABI.json'
import styles from './AdminPage.module.css'

const AdminPage = ({ selectedWallet }) => {
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenRate, setTokenRate] = useState('')
  const [newTokenRate, setNewTokenRate] = useState('')
  const [buyTax, setBuyTax] = useState('')
  const [recoverTokenAddress, setRecoverTokenAddress] = useState('')
  const [recoverTokenAmount, setRecoverTokenAmount] = useState('')

  const provider = new ethers.JsonRpcProvider(
    'https://polygon-mainnet.g.alchemy.com/v2/pmUZRjDjzs7tWIVU8AbhC4EHL7Im-WcO'
  )
  console.log('provider', provider)
  const goldContract = new ethers.Contract(
    '0x68Cd469503384EA977809d898eFae5423C78Dfa2',
    GoldABI,
    provider
  )

  const handleAddWhitelistedToken = async () => {
    try {
      const tx = await goldContract.addWhitelistedToken(
        tokenAddress,
        ethers.parseUnits(tokenRate, 18)
      )
      await tx.wait()
      alert('Token added successfully')
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveWhitelistedToken = async () => {
    try {
      const tx = await goldContract.removeWhitelistedToken(tokenAddress)
      await tx.wait()
      alert('Token removed successfully')
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateTokenRate = async () => {
    try {
      const tx = await goldContract.updateWhitelistedTokenRate(
        tokenAddress,
        ethers.parseUnits(newTokenRate, 18)
      )
      await tx.wait()
      alert('Token rate updated successfully')
    } catch (error) {
      console.error(error)
    }
  }

  const handleSetBuyTax = async () => {
    try {
      const tx = await goldContract.setBuyTax(ethers.parseUnits(buyTax, 18))
      await tx.wait()
      alert('Buy tax set successfully')
    } catch (error) {
      console.error(error)
    }
  }

  const handleRecoverERC20 = async () => {
    try {
      const tx = await goldContract.recoverERC20(
        recoverTokenAddress,
        ethers.parseUnits(recoverTokenAmount, 18)
      )
      await tx.wait()
      alert('Tokens recovered successfully')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminSection}>
        <h2>Add Whitelisted Token</h2>
        <input
          type="text"
          placeholder="Token Address"
          value={tokenAddress}
          onChange={e => setTokenAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token Rate"
          value={tokenRate}
          onChange={e => setTokenRate(e.target.value)}
        />
        <button onClick={handleAddWhitelistedToken}>Add Token</button>
      </div>

      <div className={styles.adminSection}>
        <h2>Remove Whitelisted Token</h2>
        <input
          type="text"
          placeholder="Token Address"
          value={tokenAddress}
          onChange={e => setTokenAddress(e.target.value)}
        />
        <button onClick={handleRemoveWhitelistedToken}>Remove Token</button>
      </div>

      <div className={styles.adminSection}>
        <h2>Update Token Rate</h2>
        <input
          type="text"
          placeholder="Token Address"
          value={tokenAddress}
          onChange={e => setTokenAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="New Token Rate"
          value={newTokenRate}
          onChange={e => setNewTokenRate(e.target.value)}
        />
        <button onClick={handleUpdateTokenRate}>Update Rate</button>
      </div>

      <div className={styles.adminSection}>
        <h2>Set Buy Tax</h2>
        <input
          type="text"
          placeholder="Buy Tax"
          value={buyTax}
          onChange={e => setBuyTax(e.target.value)}
        />
        <button onClick={handleSetBuyTax}>Set Buy Tax</button>
      </div>

      <div className={styles.adminSection}>
        <h2>Recover ERC20</h2>
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
        <button onClick={handleRecoverERC20}>Recover Tokens</button>
      </div>
    </div>
  )
}

export default AdminPage


*/
