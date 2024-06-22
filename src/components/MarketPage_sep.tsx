import React, { useState, useMemo, useEffect } from 'react'
import { ethers } from 'ethers'
import './MarketPage_sep.css'
import TokenABI from '../abi/TokenTestABI.json'
import DollarRain from './DollarRain'

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

interface MarketPageProps {
  selectedWallet: EIP6963ProviderDetail
  userAccount: string
}

const MarketPage: React.FC<MarketPageProps> = ({
  selectedWallet,
  userAccount,
}) => {
  const [token, setToken] = useState('SWORD')
  const [amount, setAmount] = useState('0')
  const [balance, setBalance] = useState('0')

  const [showConfetti, setShowConfetti] = useState(false)

  const DECIMALS = 18

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
  const { ROCK_ADDRESS = '', SWORD_ADDRESS = '' } = networkConfig
    ? networkConfig.contracts
    : {}

  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), [RPC_URL])

  const getSwordContract = async () => {
    const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
    const signer = await web3Provider.getSigner()
    return new ethers.Contract(SWORD_ADDRESS, TokenABI, signer)
  }

  const getRockContract = async () => {
    const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
    const signer = await web3Provider.getSigner()
    return new ethers.Contract(ROCK_ADDRESS, TokenABI, signer)
  }

  const swordRead = useMemo(
    () => new ethers.Contract(SWORD_ADDRESS, TokenABI, provider),
    [SWORD_ADDRESS, provider]
  )
  const rockRead = useMemo(
    () => new ethers.Contract(ROCK_ADDRESS, TokenABI, provider),
    [ROCK_ADDRESS, provider]
  )

  useEffect(() => {
    if (!userAccount || !selectedWallet) return

    const getBalance = async () => {
      if (token === 'SWORD') {
        const balance = await swordRead.balanceOf(userAccount)
        setBalance(balance.toString())
      } else {
        const balance = await rockRead.balanceOf(userAccount)
        setBalance(balance.toString())
      }
    }
    getBalance()
  }, [userAccount, selectedWallet, token, swordRead, rockRead])

  const handleAmountChange = event => {
    const newValue = parseFloat(event.target.value)
    if (newValue >= 0) {
      setAmount(newValue.toString())
    } else {
      setAmount('0')
    }
  }

  const formattedBalance = useMemo(() => {
    const format = ethers.formatUnits(balance, DECIMALS)
    return parseFloat(format).toFixed(2)
  }, [balance])

  const handleMintFree = async () => {
    if (!userAccount || !selectedWallet) return

    try {
      const signerContract =
        token === 'SWORD' ? await getSwordContract() : await getRockContract()

      const amountInWei = ethers.parseUnits(amount, DECIMALS)
      console.log('amountInWei', amountInWei)
      const tx = await signerContract.mint(amountInWei.toString())

      await tx.wait()
      const getBalance = async () => {
        if (token === 'SWORD') {
          const balance = await swordRead.balanceOf(userAccount)
          setBalance(balance.toString())
        } else {
          const balance = await rockRead.balanceOf(userAccount)
          setBalance(balance.toString())
        }
      }
      getBalance()
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
      alert(`It was done! Minted ${amount} ${token}`)
    } catch (error) {
      console.error(error)
      alert('An error occurred during the mint.')
    }
  }

  return (
    <div className="swap-container">
      <p className="swap-note">
        Here you can mint ROCK tokens and SWARD tokens free.
      </p>
      <div className="swap-box">
        <div className="swap-section">
          <label htmlFor="fromToken">Token</label>
          <select
            id="fromToken"
            value={token}
            onChange={e => setToken(e.target.value)}
          >
            <option value="SWORD">SWORD</option>
            <option value="ROCK">ROCK</option>
          </select>
        </div>
        <p className="balance-text">Balance: {formattedBalance}</p>
        <div className="swap-section">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            placeholder="Enter amount"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
        <button className="swap-button" onClick={handleMintFree}>
          Mint
        </button>
      </div>
      {userAccount && (
        <>
          <p>ROCK: {ROCK_ADDRESS}</p>
          <p>SWORD: {SWORD_ADDRESS}</p>
        </>
      )}
      {showConfetti && <DollarRain />}
    </div>
  )
}

export default MarketPage
