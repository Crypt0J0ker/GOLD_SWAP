import React, { useState, useEffect, useMemo } from 'react'
import './SwapPage.css'
import { ethers } from 'ethers'
import { formatBalance } from '~/utils'
import DollarRain from './DollarRain.js'

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

const SwapPage = ({ selectedWallet, userAccount }) => {
  const [fromToken, setFromToken] = useState('ROCK')
  const [balance, setBalance] = useState(0)
  const [goldBalance, setGoldBalance] = useState(0n)
  const [amount, setAmount] = useState(0)
  const [rate, setRate] = useState(0)
  const toToken = 'GOLD'
  const buyTax = 5 // 5% tax

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
  const {
    GOLD_ADDRESS = '',
    ROCK_ADDRESS = '',
    SWORD_ADDRESS = '',
  } = networkConfig ? networkConfig.contracts : {}

  console.log('RPC_URL', RPC_URL)

  const [showConfetti, setShowConfetti] = useState(false)

  const provider = useMemo(() => {
    if (RPC_URL) {
      return new ethers.JsonRpcProvider(RPC_URL)
    } else {
      console.error('RPC_URL is not available')
      return null
    }
  }, [RPC_URL])

  const GOLD_Contract = useMemo(() => {
    if (provider) {
      return new ethers.Contract(
        GOLD_ADDRESS,
        [
          'function burnAndMint(address token, uint256 amount)',
          'function whitelistedTokens(address) view returns (uint256, bool)',
        ],
        provider
      )
    } else {
      return null
    }
  }, [provider])

  useEffect(() => {
    if (!GOLD_Contract) return

    const fetchRate = async () => {
      try {
        const result = await GOLD_Contract.whitelistedTokens(
          fromToken === 'ROCK' ? ROCK_ADDRESS : SWORD_ADDRESS
        )
        const rateValue = result[0].toString()
        setRate(rateValue)
      } catch (error) {
        console.error('Error fetching rate:', error)
      }
    }

    fetchRate()
  }, [fromToken, GOLD_Contract])

  useEffect(() => {
    if (!userAccount || !provider) return

    const getUserTokenBalance = async () => {
      try {
        const contractAddress =
          fromToken === 'ROCK' ? ROCK_ADDRESS : SWORD_ADDRESS
        const contract = new ethers.Contract(
          contractAddress,
          ['function balanceOf(address account) view returns (uint256)'],
          provider
        )
        const balance = await contract.balanceOf(userAccount)
        setBalance(Number(balance))
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    const getUserGoldBalance = async () => {
      try {
        const contract = new ethers.Contract(
          GOLD_ADDRESS,
          ['function balanceOf(address account) view returns (uint256)'],
          provider
        )
        const balance = await contract.balanceOf(userAccount)
        setGoldBalance(balance)
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    getUserTokenBalance()
    getUserGoldBalance()
  }, [fromToken, userAccount, provider])

  const handleSwap = async () => {
    if (!userAccount || !selectedWallet) return

    try {
      const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
      const signer = await web3Provider.getSigner()
      const count = ethers.parseEther(amount.toString())

      const tokenAddress = fromToken === 'ROCK' ? ROCK_ADDRESS : SWORD_ADDRESS
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function approve(address spender, uint256 amount) public returns (bool)',
        ],
        signer
      )

      const approveTx = await tokenContract.approve(GOLD_ADDRESS, count)
      await approveTx.wait()
      console.log('Approve transaction successful:', approveTx)

      const goldContract = new ethers.Contract(
        GOLD_ADDRESS,
        ['function burnAndMint(address token, uint256 amount)'],
        signer
      )
      const tx = await goldContract.burnAndMint(tokenAddress, count)
      await tx.wait()

      const getUserTokenBalance = async () => {
        try {
          const contractAddress =
            fromToken === 'ROCK' ? ROCK_ADDRESS : SWORD_ADDRESS
          const contract = new ethers.Contract(
            contractAddress,
            ['function balanceOf(address account) view returns (uint256)'],
            provider
          )
          const balance = await contract.balanceOf(userAccount)
          setBalance(Number(balance))
        } catch (error) {
          console.error('Error fetching balance:', error)
        }
      }

      const getUserGoldBalance = async () => {
        try {
          const contract = new ethers.Contract(
            GOLD_ADDRESS,
            ['function balanceOf(address account) view returns (uint256)'],
            provider
          )
          const balance = await contract.balanceOf(userAccount)
          setGoldBalance(balance)
        } catch (error) {
          console.error('Error fetching balance:', error)
        }
      }

      getUserTokenBalance()
      getUserGoldBalance()
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
      console.log('Transaction successful:', tx)
    } catch (error) {
      console.error('Error swapping tokens:', error)
    }
  }

  const handleFromTokenChange = event => {
    setFromToken(event.target.value)
  }

  const handleAmountChange = event => {
    const newValue = parseFloat(event.target.value)

    if (newValue >= 0) {
      const balanceInTokens = parseFloat(
        (balance / 1000000000000000000).toString()
      )

      if (newValue <= balanceInTokens) {
        setAmount(newValue)
      } else {
        setAmount(balanceInTokens)
      }
    } else {
      setAmount(0)
    }
  }

  const calculateConvertedAmount = amount => {
    return (amount * rate * (100 - buyTax)) / 10000
  }

  return (
    <div className="swap-container">
      <p className="swap-note">
        Here you can exchange Rock tokens for Gold tokens at a ratio of 100 / 1
        and SWORD tokens for Gold tokens at a ratio of 1 / 100.
      </p>
      <p className="swap-note">
        Note: 5% will be deducted as a buy tax. 95% are burned.
      </p>
      <div className="swap-box">
        <div className="swap-section">
          <label htmlFor="from-token">From:</label>
          <select
            id="from-token"
            value={fromToken}
            onChange={handleFromTokenChange}
          >
            <option value="ROCK">ROCK</option>
            <option value="SWORD">SWORD</option>
          </select>
        </div>
        <p className="balance-text">
          Balance: {formatBalance(balance.toString())}
        </p>
        <div className="swap-section">
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
        <div className="swap-section">
          <label htmlFor="to-token">To:</label>
          <input id="to-token" type="text" value={toToken} readOnly />
        </div>
        <div className="swap-section">
          <label htmlFor="to-amount">Converted Amount:</label>
          <input
            id="to-amount"
            type="number"
            value={calculateConvertedAmount(amount)}
            readOnly
          />
        </div>
        <p className="balance-text-gold">
          GOLD balance: {ethers.formatEther(goldBalance)}
        </p>
        <button className="swap-button" onClick={handleSwap}>
          Swap
        </button>
      </div>
      <p>GOLD: {GOLD_ADDRESS}</p>
      <p>ROCK: {ROCK_ADDRESS}</p>
      <p>SWORD: {SWORD_ADDRESS}</p>
      {showConfetti && <DollarRain />}
    </div>
  )
}

export default SwapPage
