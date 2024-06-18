import React, { useState, useMemo, useEffect } from 'react'
import { ethers } from 'ethers'
import './SwapPage.css'
import TokenABI from '../abi/TokenABI.json'
import DollarRain from './DollarRain'

interface SwapPageProps {
  selectedWallet: EIP6963ProviderDetail
  userAccount: string
}

const SwapPage: React.FC<SwapPageProps> = ({ selectedWallet, userAccount }) => {
  const [fromToken, setFromToken] = useState('USDT')
  const [toToken, setToToken] = useState('SWORD')
  const [amount, setAmount] = useState('0')
  const [amountInWei, setAmountInWei] = useState(BigInt(0))
  const [balance, setBalance] = useState(BigInt(0))
  const [amountOut, setAmountOut] = useState('0')
  const [showConfetti, setShowConfetti] = useState(false)

  const STABLE_DECIMALS = 6
  const MATIC_DECIMALS = 18

  const SWORD_Address = '0x0ad67d7DFAADC0df023A2248B67B73ff74521895'
  const ROCK_Address = '0xc43D0432c876a8e7b428f0f65E863037BbA564aC'

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tokenAddresses = {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  }

  const erc20Abi = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
  ]

  const RPC_URL =
    'https://polygon-mainnet.g.alchemy.com/v2/pmUZRjDjzs7tWIVU8AbhC4EHL7Im-WcO'
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), [])

  const getSwordContract = async () => {
    const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
    const signer = await web3Provider.getSigner()
    return new ethers.Contract(SWORD_Address, TokenABI, signer)
  }

  const getRockContract = async () => {
    const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
    const signer = await web3Provider.getSigner()
    return new ethers.Contract(ROCK_Address, TokenABI, signer)
  }

  const swordRead = useMemo(
    () => new ethers.Contract(SWORD_Address, TokenABI, provider),
    [provider]
  )
  const rockRead = useMemo(
    () => new ethers.Contract(ROCK_Address, TokenABI, provider),
    [provider]
  )

  useEffect(() => {
    if (!userAccount || !selectedWallet) return

    const getUserBalance = async () => {
      try {
        let balanceBN
        if (fromToken === 'MATIC') {
          balanceBN = await provider.getBalance(userAccount)
        } else {
          const contract = new ethers.Contract(
            tokenAddresses[fromToken],
            ['function balanceOf(address account) view returns (uint256)'],
            provider
          )
          balanceBN = await contract.balanceOf(userAccount)
        }
        setBalance(balanceBN)
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    getUserBalance()
  }, [userAccount, provider, fromToken, selectedWallet, tokenAddresses])

  useEffect(() => {
    if (!userAccount || !selectedWallet || !provider || !swordRead || !rockRead)
      return

    const getRate = async () => {
      try {
        let rate
        if (toToken === 'SWORD') {
          rate =
            fromToken === 'MATIC'
              ? await swordRead.ethRate()
              : await swordRead[`${fromToken.toLowerCase()}Rate`]()
        } else if (toToken === 'ROCK') {
          rate =
            fromToken === 'MATIC'
              ? await rockRead.ethRate()
              : await rockRead[`${fromToken.toLowerCase()}Rate`]()
        }

        rate = BigInt(rate)

        const decimals =
          fromToken === 'MATIC' ? MATIC_DECIMALS : STABLE_DECIMALS
        const amountBigInt = BigInt(parseFloat(amount) * 10 ** decimals)
        setAmountInWei(amountBigInt)

        const amountToMintBN = (amountBigInt * rate) / BigInt(10 ** decimals)
        const amountToMint = ethers.formatUnits(amountToMintBN, 18)
        const formattedAmountToMint = parseFloat(amountToMint).toFixed(2)
        setAmountOut(formattedAmountToMint)
      } catch (error) {
        console.error('Error fetching rate:', error)
      }
    }

    getRate()
  }, [
    fromToken,
    toToken,
    provider,
    userAccount,
    selectedWallet,
    swordRead,
    rockRead,
    amount,
  ])

  const handleAmountChange = event => {
    const newValue = parseFloat(event.target.value)
    if (newValue >= 0) {
      setAmount(newValue.toString())
    } else {
      setAmount('0')
    }
  }

  const formattedBalance = useMemo(() => {
    const decimals = fromToken === 'MATIC' ? 18 : STABLE_DECIMALS
    const format = ethers.formatUnits(balance, decimals)
    return parseFloat(format).toFixed(2)
  }, [fromToken, balance])

  const handleSwap = async () => {
    if (!userAccount || !selectedWallet) return

    try {
      let signerContract, tx
      const web3Provider = new ethers.BrowserProvider(selectedWallet.provider)
      const signer = await web3Provider.getSigner()

      if (fromToken === 'MATIC') {
        tx = await signer.sendTransaction({
          to: toToken === 'SWORD' ? SWORD_Address : ROCK_Address,
          value: amountInWei.toString(),
        })
      } else {
        signerContract =
          toToken === 'SWORD'
            ? await getSwordContract()
            : await getRockContract()

        const stableCoinAddress =
          fromToken === 'USDT' ? tokenAddresses.USDT : tokenAddresses.USDC
        const stableCoinContract = new ethers.Contract(
          stableCoinAddress,
          erc20Abi,
          signer
        )

        const approveTx = await stableCoinContract.approve(
          signerContract.target,
          amountInWei
        )
        await approveTx.wait()

        const allowance = BigInt(
          await stableCoinContract.allowance(userAccount, signerContract.target)
        )
        if (allowance < amountInWei) {
          throw new Error('Insufficient allowance')
        }

        const mintFunction = `mintWith${fromToken}`
        tx = await signerContract[mintFunction](amountInWei.toString())
      }

      await tx.wait()
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
      alert(`It was done! Swapped ${amount} ${fromToken} for ${toToken}`)
    } catch (error) {
      console.error(error)
      alert('An error occurred during the swap.')
    }
  }

  return (
    <div className="swap-container">
      <p className="swap-note">
        Here you can acquire ROCK tokens and SWARD tokens without any
        commission.
      </p>
      <div className="swap-box">
        <div className="swap-section">
          <label htmlFor="fromToken">From</label>
          <select
            id="fromToken"
            value={fromToken}
            onChange={e => setFromToken(e.target.value)}
          >
            <option value="MATIC">MATIC</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
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
        <div className="swap-section">
          <label htmlFor="toToken">To</label>
          <select
            id="toToken"
            value={toToken}
            onChange={e => setToToken(e.target.value)}
          >
            <option value="SWORD">SWORD</option>
            <option value="ROCK">ROCK</option>
          </select>
        </div>
        <div className="swap-section">
          <label htmlFor="to-amount">Converted Amount</label>
          <input id="to-amount" type="number" value={amountOut} readOnly />
        </div>
        <button className="swap-button" onClick={handleSwap}>
          Buy
        </button>
        <p className="swap-note">
          Ensure you have enough balance to complete the purchase.
        </p>
      </div>
      <p>ROCK: {ROCK_Address}</p>
      <p>SWORD: {SWORD_Address}</p>
      {showConfetti && <DollarRain />}
    </div>
  )
}

export default SwapPage
