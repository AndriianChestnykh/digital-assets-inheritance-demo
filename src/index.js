import MetaMaskOnboarding from '@metamask/onboarding'
import { ethers } from 'ethers'

import WalletArtifact from '../artifacts/contracts/Wallet.sol/Wallet.json'
import DeployInfo from './deployInfo.json'

const { abi: walletAbi } = WalletArtifact
let walletAddress = DeployInfo.walletAddress
const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost'
  ? 'http://localhost:9010'
  : undefined

const isMetaMaskInstalled = () => {
  const { ethereum } = window
  return Boolean(ethereum && ethereum.isMetaMask)
}

// Dapp Status Section
const networkDiv = document.getElementById('network')
const accountsDiv = document.getElementById('accounts')

// Basic Actions Section
const onboardButton = document.getElementById('connectButton')

// Contract Section
const contractBalance = document.getElementById('contractBalance')
const ownerCtrBalance = document.getElementById('ownerCtrBalance')
const walletAccountDiv = document.getElementById('walletAccount')

// Send Eth Section
const sendButton = document.getElementById('sendButton')

// Signed Type Data Section
const signTypedData = document.getElementById('signTypedData')
const signTypedDataResults = document.getElementById('signTypedDataResult')

const initialize = async () => {

  let onboarding
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin })
  } catch (error) {
    console.error(error)
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  let wallet = new ethers.Contract(walletAddress, walletAbi, provider)

  let accounts
  let accountButtonsInitialized = false

  const accountButtons = [
    sendButton,
    signTypedData,
  ]

  const isMetaMaskConnected = () => accounts && accounts.length > 0

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    onboarding.startOnboarding()
  }

  const onClickConnect = async () => {
    try {
      const newAccounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      handleNewAccounts(newAccounts)
    } catch (error) {
      console.error(error)
    }
  }

  const updateButtons = () => {
    const accountButtonsDisabled = !isMetaMaskInstalled() || !isMetaMaskConnected()
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true
      }
    } else {
      sendButton.disabled = false
      signTypedData.disabled = false
    }

    if (!isMetaMaskInstalled()) {
      onboardButton.innerText = 'Click here to install MetaMask!'
      onboardButton.onclick = onClickInstall
      onboardButton.disabled = false
    } else if (isMetaMaskConnected()) {
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
      if (onboarding) {
        onboarding.stopOnboarding()
      }
    } else {
      onboardButton.innerText = 'Connect'
      onboardButton.onclick = onClickConnect
      onboardButton.disabled = false
    }
  }

  const initializeAccountButtons = () => {

    if (accountButtonsInitialized) {
      return
    }
    accountButtonsInitialized = true

    /**
     * Contract Interactions
     */

    /**
     * Sending ETH
     */

    sendButton.onclick = () => {
      sendEther()
    }

    /**
     * Sign Typed Data
     */

    signTypedData.onclick = async () => {
      const networkId = parseInt(networkDiv.innerHTML, 10)
      // const chainId = parseInt(chainIdDiv.innerHTML, 10) || networkId
      const chainId = 31337 || networkId
      // const owner = provider.getSigner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
      const _accounts = await ethereum.request({
        method: 'eth_accounts',
      })

      const owner = provider.getSigner(_accounts[0])
      const inputAddr = document.getElementById('inputAddr')
      const heir = provider.getSigner(inputAddr.value)

      const typedData = {
        types: {
          InheritanceMessage: [
            { name: 'heirAddress', type: 'address' },
          ],
        },
        primaryType: 'InheritanceMessage',
        domain: {
          name: 'InheritanceMessage',
          version: '1',
          chainId,
          verifyingContract: walletAddress,
        },
        message: {
          heirAddress: heir._address,
        },
      }

      try {
        const result2 = await owner._signTypedData(typedData.domain, typedData.types, typedData.message)

        signTypedDataResults.innerHTML = `
          ${JSON.stringify(typedData, null, 2)}
          \n\nSignature\n${JSON.stringify(result2, null, 2)}`

      } catch (err) {
        console.error(err)
      }
    }

  }

  function handleNewAccounts (newAccounts) {
    accounts = newAccounts
    accountsDiv.innerHTML = accounts
    if (isMetaMaskConnected()) {
      initializeAccountButtons()
    }
    updateButtons()
  }

  function getWalletAddress () {
    walletAccountDiv.innerHTML = wallet.address
  }

  function handleNewNetwork (networkId) {
    networkDiv.innerHTML = networkId
  }

  async function getNetworkId () {
    try {
      const networkId = await ethereum.request({
        method: 'net_version',
      })
      handleNewNetwork(networkId)
    } catch (err) {
      console.error(err)
    }
  }

  async function getBalance () {
    try {
      const accounts = await ethereum.request({
        method: 'eth_accounts',
      })
      const balance = await provider.getBalance(accounts[0])
      ownerCtrBalance.innerHTML = `${ethers.utils.formatEther(balance.toString())} ETH`
    } catch (err) {
      console.error(err)
    }
  }

  async function getWalletBalance () {
    try {
      const balance = await provider.getBalance(wallet.address)
      contractBalance.innerHTML = `${ethers.utils.formatEther(balance.toString())} ETH`
    } catch (err) {
      console.error(err)
    }
  }

  async function sendEther () {
    try {
      const accounts = await ethereum.request({
        method: 'eth_accounts',
      })

      const transactionParameters = {
        // nonce: '0x00', // ignored by MetaMask
        // gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
        // gas: '0x27100', // customizable by user during MetaMask confirmation.
        to: "0x2f318C334780961FB129D2a6c30D0763d9a5C970", // Required except during contract publications.
        from: accounts[0], // must match user's active address.
        value: ethers.utils.parseEther("0.1").toHexString(), // Only required to send ether to the recipient from the initiating external account.
        // data:
        //   '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
        // chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      }

      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

    } catch (err) {
      console.error(err)
    }
  }

  updateButtons()
  if (isMetaMaskInstalled()) {

    ethereum.autoRefreshOnNetworkChange = false

    getNetworkId()
    getBalance()
    getWalletBalance()
    getWalletAddress()

    ethereum.on('networkChanged', handleNewNetwork)
    ethereum.on('accountsChanged', handleNewAccounts)

    try {
      const newAccounts = await ethereum.request({
        method: 'eth_accounts',
      })
      handleNewAccounts(newAccounts)
    } catch (err) {
      console.error('Error on init when getting accounts', err)
    }
  }
}

window.addEventListener('DOMContentLoaded', initialize)


