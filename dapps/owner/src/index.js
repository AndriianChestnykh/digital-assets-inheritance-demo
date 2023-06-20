import MetaMaskOnboarding from '@metamask/onboarding'
import { ethers } from 'ethers'

import WalletArtifact from '../../../artifacts/contracts/Wallet.sol/Wallet.json'
import DeployInfo from '../../../deployInfo.json'

const { abi: walletAbi } = WalletArtifact

let wallet;
let walletIntervalID;
const updateWalletInterval = 5000;
let controllerTransferInitLastBlock = 0;
let controllerTransferFinalizedLastBlock = 0;

const isMetaMaskInstalled = () => {
  const { ethereum } = window
  return Boolean(ethereum && ethereum.isMetaMask)
}

// Network Section
const networkDiv = document.getElementById('network')

// Account Section
const accountsAddressDiv = document.getElementById('accountAddress')
const accountBalance = document.getElementById('accountBalance')

// Basic Actions Section
const connectButton = document.getElementById('connectButton')

// Wallet Section
const walletAddressDiv = document.getElementById('walletAddress')
const walletBalance = document.getElementById('walletBalance')
const walletController = document.getElementById('walletController')
const walletPendingController = document.getElementById('walletPendingController')
const pendingControllerBlocksLeft = document.getElementById('walletPendingControllerBlocksLeft')

// Send Eth Section
const sendButton = document.getElementById('sendButton')

// Signed Type Data Section
const signTypedData = document.getElementById('signTypedData')
const signTypedDataResult = document.getElementById('signTypedDataResult')

const initialize = async () => {

  const provider = new ethers.providers.Web3Provider(window.ethereum)

  let accounts
  let accountButtonsInitialized = false

  const buttons = [
    sendButton,
    signTypedData,
  ]

  const isMetaMaskConnected = () => accounts && accounts.length > 0

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
    for (const button of buttons) {
      button.disabled = accountButtonsDisabled
    }

    if (isMetaMaskConnected()) {
      connectButton.innerText = 'Connected'
      connectButton.disabled = true
    } else {
      connectButton.innerText = 'Connect'
      connectButton.onclick = onClickConnect
      connectButton.disabled = false
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
      const chainId = 31337 || networkId
      const _accounts = await ethereum.request({
        method: 'eth_accounts',
      })

      //todo - get heir address from heirAddress.value
      const signer = provider.getSigner(_accounts[0])
      const heirAddress = document.getElementById('heirAddress')
      const heir = provider.getSigner(heirAddress.value)

      const im = {
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
          verifyingContract: wallet.address,
        },
        message: {
          heirAddress: heir._address,
        },
      }

      try {
        const imSignature = await signer._signTypedData(im.domain, im.types, im.message)

        const imWithSignature = {
          message: im,
          signature: imSignature,
        }

        signTypedDataResult.innerHTML = JSON.stringify(imWithSignature, null, 2)
        sendIMToOracle.disabled = false
      } catch (err) {
        console.error(err)
      }
    }

    sendIMToOracle.onclick = async () => {
      const url = "http://localhost:8080/"
      const data = signTypedDataResult.innerHTML

      const options = {
        method: 'POST',
        body: JSON.stringify(JSON.parse(data)),
        headers: {
          'Content-Type': 'application/json',
        },
      }

      try {
        const res = await fetch(url, options)
      } catch (err) {
        console.error(err)
      }
    }
  }

  function handleNewAccounts (newAccounts) {
    accounts = newAccounts
    accountsAddressDiv.innerHTML = accounts
    if (isMetaMaskConnected()) {
      initializeAccountButtons()
    }
    updateButtons()
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
      accountBalance.innerHTML = `${ethers.utils.formatEther(balance.toString())} ETH`
    } catch (err) {
      console.error(err)
    }
  }

  async function connectWalletUI (address) {
    wallet = new ethers.Contract(address, walletAbi, provider)
    await updateWalletInfo()
    walletIntervalID = setInterval(updateWalletInfo, updateWalletInterval)
  }

  function disconnectWalletUI () {
    wallet = null
    clearInterval(walletIntervalID)
  }

  async function updateWalletInfo() {
    if (!walletAddress) return

    try {
      walletAddressDiv.innerHTML = wallet.address
      const balance = await provider.getBalance(wallet.address)
      walletBalance.innerHTML = `${ethers.utils.formatEther(balance.toString())} ETH`
      walletController.innerHTML = await wallet.controller()
      walletPendingController.innerHTML = await wallet.pendingController()
      // ethers get current block number
      const currentBlock = parseInt(await provider.getBlockNumber())
      const commitBlock = parseInt(await wallet.pendingControllerCommitBlock())
      const gracePeriod = parseInt(await wallet.gracePeriodBlocks())
      const blocksLeft = commitBlock + gracePeriod - currentBlock;
      pendingControllerBlocksLeft.innerHTML = `${commitBlock}, ${currentBlock}, ${gracePeriod}, <span style="color:red">${commitBlock > 0 ? blocksLeft : "-"}</span>`

      let filter = wallet.filters.ControllerTransferInitiated()
      let events = await wallet.queryFilter(filter, controllerTransferInitLastBlock, "latest")

      if (events.length > 0) {
        const event = events[events.length - 1];
        controllerTransferInitLastBlock = event.blockNumber + 1
        processControllerTransferInit(event)
      }

      filter = wallet.filters.ControllerTransferFinalized()
      events = await wallet.queryFilter(filter, controllerTransferFinalizedLastBlock, "latest")

      if (events.length > 0) {
        const event = events[events.length - 1];
        controllerTransferFinalizedLastBlock = event.blockNumber + 1
        processControllerTransferFinalized(event)
      }
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
    await connectWalletUI(DeployInfo.walletAddress)

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

  function processControllerTransferInit(event) {
    createPopup(`Controller transfer initiated to ${event.args.newController}`)
  }

  function processControllerTransferFinalized(event) {
    createPopup(`Controller transfer finalized to ${event.args.newController}`)
  }

  // TODO make this a good UI
  function createPopup(message) {
    alert(message);
  }
}

window.addEventListener('DOMContentLoaded', initialize)


