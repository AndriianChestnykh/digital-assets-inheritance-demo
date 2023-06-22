import { ethers } from 'ethers'

import WalletArtifact from '../../../artifacts/contracts/Wallet.sol/Wallet.json'
import DeployInfo from '../../../deployInfo.json'
import { splitSignature } from "ethers/lib/utils";

const { abi: walletAbi } = WalletArtifact

let wallet;
let accounts
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
const connectWalletButton = document.getElementById('connectWalletButton')
const disconnectWalletButton = document.getElementById('disconnectWalletButton')

// Wallet Section
const walletAddressToConnect = document.getElementById('walletAddressToConnect')
const walletDiv = document.getElementById('wallet')
const walletAddressDiv = document.getElementById('walletAddress')
const walletBalance = document.getElementById('walletBalance')
const walletController = document.getElementById('walletController')
const walletPendingController = document.getElementById('walletPendingController')
const pendingControllerBlocksLeft = document.getElementById('walletPendingControllerBlocksLeft')
const initControllerTransferButton = document.getElementById('initControllerTransferButton')
const finalizeControllerTransferButton = document.getElementById('finalizeControllerTransferButton')
const cancelControllerChangeButton = document.getElementById('cancelControllerChangeButton')

// Send Eth Section
const sendButton = document.getElementById('sendButton')

// Signed Type Data Section
const signTypedData = document.getElementById('signTypedData')
const signTypedDataResult = document.getElementById('signTypedDataResult')
const signedTypedDataFromOwnerDiv = document.getElementById('signedTypedDataFromOwner')

const sendIMToOracleButton = document.getElementById('sendIMToOracleButton')
const getIMFromOracleButton = document.getElementById('getIMFromOracleButton')


const provider = new ethers.providers.Web3Provider(window.ethereum)

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

const onClickConnectWallet = async () => {
  connectWalletUI(walletAddressToConnect.value)
}

const onClickDisconnectWallet = async () => {
  disconnectWalletUI()
}

const updateButtons = () => {
  const accountButtonsDisabled = !isMetaMaskInstalled() || !isMetaMaskConnected()
  for (const button of buttons) {
    button.disabled = accountButtonsDisabled
  }

  if (isMetaMaskConnected()) {
    connectButton.innerText = 'Connected'
    connectButton.disabled = true
    connectWalletButton.disabled = false
    disconnectWalletButton.disabled = true
    getIMFromOracleButton.disabled = false
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

  sendButton.onclick = () => {
    sendEther()
  }

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
      sendIMToOracleButton.disabled = false
    } catch (err) {
      console.error(err)
    }
  }
}

async function sendIMToOracle () {
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
    await fetch(url, options)
  } catch (err) {
    console.error(err)
  }
}

async function getIMFromOracle () {
  const response = await fetch('http://localhost:8080')
  const data = await response.json()
  signedTypedDataFromOwnerDiv.value = JSON.stringify(data)
  onChangeSignedTypedDataFromOwner()
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
  await updateWalletDiv()
  walletIntervalID = setInterval(updateWalletDiv, updateWalletInterval)
  walletDiv.style.visibility = "visible"
  disconnectWalletButton.disabled = false
}

function disconnectWalletUI () {
  wallet = null
  clearInterval(walletIntervalID)
  walletDiv.style.visibility = "hidden"
  disconnectWalletButton.disabled = true
}

async function updateWalletDiv() {
  if (!walletAddress) return

  try {
    const wi = await getWalletInfo(wallet)

    walletAddressDiv.innerHTML =  wi.address
    walletBalance.innerHTML = `${ethers.utils.formatEther(wi.balance.toString())} ETH`
    walletController.innerHTML = wi.controller
    walletPendingController.innerHTML = wi.pendingController
    const commitBlock = wi.pendingControllerCommitBlock;
    const deadline = commitBlock + wi.gracePeriodBlocks
    const currentBlock = wi.currentBlock;
    const blocksLeft = deadline - currentBlock;
    pendingControllerBlocksLeft.innerHTML =
      `${commitBlock}, ${deadline}, ${currentBlock}, <span style="color:red">${commitBlock > 0 ? blocksLeft : "-"}</span>`

    if (currentBlock > deadline) {
      finalizeControllerTransferButton.disabled = false
    }

    cancelControllerChangeButton.disabled = wi.pendingController === "0x".padEnd(42, "0")

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

function processControllerTransferInit(event) {
  createPopup(`Controller transfer initiated to ${event.args.newController}`)
}

function processControllerTransferFinalized(event) {
  createPopup(`Controller transfer finalized to ${event.args.newController}`)
}

async function onClickInitControllerTransfer() {
  const typedData = signedTypedDataFromOwnerDiv.value
  await controllerTransfer(typedData)
}

async function controllerTransfer(typedData) {
  const imWithSignature = JSON.parse(typedData);
  const addr = imWithSignature.message.domain.verifyingContract
  connectWalletUI(addr)

  const signature = imWithSignature.signature;
  const splitedSignature = splitSignature(signature);

  const _accounts = await ethereum.request({
    method: 'eth_accounts',
  })
  const heirAddress = _accounts[0];
  const signer = provider.getSigner(heirAddress)
  //todo check heir address coincides with IM address

  await wallet.connect(signer).initControllerChange(
    heirAddress,
    { heirAddress: heirAddress },
    splitedSignature.r,
    splitedSignature.s,
    splitedSignature.v,
  );
}

async function onClickFinalizeControllerTransfer() {
  await finalizeControllerTransfer()
}

async function finalizeControllerTransfer() {
  const _accounts = await ethereum.request({
    method: 'eth_accounts',
  })
  const heirAddress = _accounts[0];
  const signer = provider.getSigner(heirAddress)
  await wallet.connect(signer).finalizeControllerChange();
}

async function onClickcancelControllerChange() {
  await cancelControllerChange()
}

async function cancelControllerChange() {
  const _accounts = await ethereum.request({
    method: 'eth_accounts',
  })
  const heirAddress = _accounts[0];
  const signer = provider.getSigner(heirAddress)
  await wallet.connect(signer).cancelControllerChange();
}

// TODO implement good UI for the popup
function createPopup(message) {
  alert(message);
}

async function getWalletInfo(wallet) {
  return {
    address: wallet.address,
    balance: await provider.getBalance(wallet.address),
    controller: await wallet.controller(),
    pendingController: await wallet.pendingController(),
    currentBlock: parseInt(await provider.getBlockNumber()),
    pendingControllerCommitBlock: parseInt(await wallet.pendingControllerCommitBlock()),
    gracePeriodBlocks: parseInt(await wallet.gracePeriodBlocks()),
  }
}

function onChangeSignedTypedDataFromOwner() {
  const typedData = signedTypedDataFromOwnerDiv.value
  const im = JSON.parse(typedData);
  if (im.message.message.heirAddress.toLowerCase() === accountsAddressDiv.innerHTML.toLowerCase()) {
    initControllerTransferButton.disabled = false
  } else {
    alert("Heir address in the typed data doesn't match with the current account address")
    signedTypedDataFromOwnerDiv.value = ""
    return
  }

  const addr = im.message.domain.verifyingContract
  connectWalletUI(addr)
}

const initialize = async () => {
  if (isMetaMaskInstalled()) {

    ethereum.autoRefreshOnNetworkChange = false

    getNetworkId()
    getBalance()

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

  walletDiv.style.visibility = "hidden"
  walletAddressToConnect.value = DeployInfo.walletAddress
  connectWalletButton.onclick = onClickConnectWallet
  disconnectWalletButton.onclick = onClickDisconnectWallet
  initControllerTransferButton.onclick = onClickInitControllerTransfer
  finalizeControllerTransferButton.onclick = onClickFinalizeControllerTransfer
  cancelControllerChangeButton.onclick = onClickcancelControllerChange

  signedTypedDataFromOwnerDiv.onchange = onChangeSignedTypedDataFromOwner
  sendIMToOracleButton.onclick = sendIMToOracle
  getIMFromOracleButton.onclick = getIMFromOracle

  updateButtons()
}

window.addEventListener('DOMContentLoaded', initialize)


