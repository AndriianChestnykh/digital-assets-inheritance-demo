import { ethers } from 'ethers'

import WalletArtifact from '../../../artifacts/contracts/Wallet.sol/Wallet.json'
import DeployInfo from '../../../deployInfo.json'
import { splitSignature } from "ethers/lib/utils";

const { abi: walletAbi } = WalletArtifact

let wallet;
let accounts
const checkEventsInterval = 3000;
let shouldCheckEvents = false;
const updateBlocksInterval = 1000;
let shouldUpdateWalletBlocks = false;

const isMetaMaskInstalled = () => {
  const { ethereum } = window
  return Boolean(ethereum && ethereum.isMetaMask)
}

// Network Section
const networkDiv = document.getElementById('network')

// Account Section
const accountsAddressDiv = document.getElementById('accountAddress')
const accountBalance = document.getElementById('accountBalance')
const updateAccountButton = document.getElementById('updateAccountButton')

// Basic Actions Section
const connectButton = document.getElementById('connectButton')
const connectWalletButton = document.getElementById('connectWalletButton')
const disconnectWalletButton = document.getElementById('disconnectWalletButton')

// Wallet Section
const walletAddressToConnect = document.getElementById('walletAddressToConnect')

const walletDiv = document.getElementById('wallet')
const updateWalletButton = document.getElementById('updateWalletButton')
const walletOwnershipStatusDiv = document.getElementById('walletOwnershipStatus')
const walletAddressDiv = document.getElementById('walletAddress')
const walletBalanceDiv = document.getElementById('walletBalance')
const walletController = document.getElementById('walletController')
const walletPendingController = document.getElementById('walletPendingController')
const commitBlockDiv = document.getElementById('commitBlock')
const currentBlockDiv = document.getElementById('currentBlock')
const countdownDiv = document.getElementById('countdown')
const initControllerTransferButton = document.getElementById('initControllerTransferButton')
const finalizeControllerTransferButton = document.getElementById('finalizeControllerTransferButton')
const cancelControllerChangeButton = document.getElementById('cancelControllerChangeButton')

// Send Eth Section
const etherAmountToSend = document.getElementById('etherAmountToSend')
const destinationAddress = document.getElementById('destinationAddress')
const sendEtherButton = document.getElementById('sendButton')

// Signed Type Data Section
const signTypedData = document.getElementById('signTypedData')
const signTypedDataResult = document.getElementById('signTypedDataResult')
const signedTypedDataFromOwnerDiv = document.getElementById('signedTypedDataFromOwner')
const sendIMToOracleButton = document.getElementById('sendIMToOracleButton')
const getIMFromOracleButton = document.getElementById('getIMFromOracleButton')

const provider = new ethers.providers.Web3Provider(window.ethereum)

let walletInfo = {
  ownershipStatus: undefined,
  address: undefined,
  balance: undefined,
  controller: undefined,
  pendingController: undefined,
  currentBlock: undefined,
  pendingControllerCommitBlock: undefined,
  gracePeriodBlocks: undefined
}

const OwnershipStatus = Object.freeze({
  IsOwner: "Your are the owner",
  IsNotOwner: "You are not the owner",
  OwnershipToYou: "Ownership is being transferred to you",
  OwnershipFromYou: "Ownership is being transferred from you"
})

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
  if (isMetaMaskConnected()) {
    connectButton.innerText = 'Connected'
    connectButton.disabled = true
    connectWalletButton.disabled = false
    disconnectWalletButton.disabled = true
    sendEtherButton.disabled = false
    signTypedData.disabled = false
  } else {
    connectButton.innerText = 'Connect'
    connectButton.onclick = onClickConnect
    connectButton.disabled = false
  }
}

async function onClickSignTypedData() {
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

async function sendIMToOracle() {
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

async function getIMFromOracle() {
  const response = await fetch('http://localhost:8080')
  const data = await response.json()
  signedTypedDataFromOwnerDiv.value = JSON.stringify(data)
  onChangeSignedTypedDataFromOwner()
}

function handleNewAccounts(newAccounts) {
  accounts = newAccounts
  accountsAddressDiv.innerHTML = accounts[0]
}

function handleNewNetwork(networkId) {
  networkDiv.innerHTML = networkId
}

async function getNetworkId() {
  try {
    const networkId = await ethereum.request({
      method: 'net_version',
    })
    handleNewNetwork(networkId)
  } catch (err) {
    console.error(err)
  }
}

async function getBalance() {
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

async function connectWalletUI(address) {
  wallet = new ethers.Contract(address, walletAbi, provider)
  await updateWalletDiv()
  await listenWalletEvents(await getWalletLastEventBlock())
  walletDiv.style.visibility = "visible"
  disconnectWalletButton.disabled = false
}

async function getWalletLastEventBlock() {
  const filters = [
    wallet.filters.ControllerTransferInitiated(),
    wallet.filters.ControllerTransferFinalized(),
    wallet.filters.ControllerTransferCancelled(),
  ]

  let lastEventBlock = 0;

  for (const filter of filters) {
    let events = await wallet.queryFilter(filter, 0, "latest")
    if (events.length > 0) {
      const event = events[events.length - 1];
      lastEventBlock = Math.max(event.blockNumber + 1, lastEventBlock)
    }
  }

  return lastEventBlock
}

function disconnectWalletUI() {
  clearWalletData()
  walletDiv.style.visibility = "hidden"
  disconnectWalletButton.disabled = true
}

function clearWalletData() {
  wallet = null
  walletInfo = {}
  shouldCheckEvents = false
}

async function startUpdatingWalletBlocks() {
  if (!shouldUpdateWalletBlocks) return

  walletInfo.currentBlock = parseInt(await provider.getBlockNumber())
  walletInfo.pendingControllerCommitBlock = parseInt(await wallet.pendingControllerCommitBlock())

  const commitBlock = walletInfo.pendingControllerCommitBlock;
  const deadline = commitBlock + walletInfo.gracePeriodBlocks
  const currentBlock = walletInfo.currentBlock;
  const blocksLeft = deadline - currentBlock;
  commitBlockDiv.innerHTML = commitBlock;
  currentBlockDiv.innerHTML = currentBlock;
  countdownDiv.innerHTML = commitBlock !== 0
    ? blocksLeft > 0 ? `${blocksLeft} blocks left` : "Deadline passed"
    : ""

  setTimeout(startUpdatingWalletBlocks, updateBlocksInterval)
}

async function updateWalletDiv() {
  if (!wallet) return

  try {
    await updateWalletInfo()
    switch (walletInfo.ownershipStatus) {
      case OwnershipStatus.IsOwner :
        initControllerTransferButton.disabled = true
        finalizeControllerTransferButton.disabled = true
        cancelControllerChangeButton.disabled = true
        break
      case OwnershipStatus.IsNotOwner:
        initControllerTransferButton.disabled = false
        finalizeControllerTransferButton.disabled = true
        cancelControllerChangeButton.disabled = true
        break
      case OwnershipStatus.OwnershipToYou:
        initControllerTransferButton.disabled = true
        finalizeControllerTransferButton.disabled = false
        cancelControllerChangeButton.disabled = true
        shouldUpdateWalletBlocks = true
        await startUpdatingWalletBlocks()
        break
      case OwnershipStatus.OwnershipFromYou:
        initControllerTransferButton.disabled = true
        finalizeControllerTransferButton.disabled = true
        cancelControllerChangeButton.disabled = false
        shouldUpdateWalletBlocks = true
        await startUpdatingWalletBlocks()
        break
      default:
        break
    }

    walletOwnershipStatusDiv.innerHTML = walletInfo.ownershipStatus
    walletAddressDiv.innerHTML = walletInfo.address
    walletBalanceDiv.innerHTML = `${ethers.utils.formatEther(walletInfo.balance.toString())} ETH`
    walletController.innerHTML = walletInfo.controller
    walletPendingController.innerHTML = walletInfo.pendingController

    shouldCheckEvents = true
  } catch (err) {
    console.error(err)
  }
}

async function listenWalletEvents(fromBlock = 0) {
  if (!shouldCheckEvents) return

  const filtersAndHandlers = [
    { filter: wallet.filters.ControllerTransferInitiated(), handler: processControllerTransferInit },
    { filter: wallet.filters.ControllerTransferFinalized(), handler: processControllerTransferFinalized },
    { filter: wallet.filters.ControllerTransferCancelled(), handler: processControllerTransferCancelled },
  ]

  let latestBlock = 0;
  try {
    for (const fh of filtersAndHandlers) {
      const events = await wallet.queryFilter(fh.filter, fromBlock, "latest")
      if (events.length > 0) {
        const event = events[events.length - 1];
        latestBlock = Math.max(event.blockNumber + 1, latestBlock)
        await fh.handler(event)
      }
    }

    latestBlock = Math.max(latestBlock, fromBlock)
  } catch (e) {
    console.error(e)
  }

  setTimeout(async () => { await listenWalletEvents(latestBlock) } , checkEventsInterval)
}

async function onClickSendEther() {
  try {
    const accounts = await ethereum.request({
      method: 'eth_accounts',
    })

    const transactionParameters = {
      // nonce: '0x00', // ignored by MetaMask
      // gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
      // gas: '0x27100', // customizable by user during MetaMask confirmation.
      to: destinationAddress.value, // Required except during contract publications.
      from: accounts[0], // must match user's active address.
      value: ethers.utils.parseEther(etherAmountToSend.value).toHexString(), // Only required to send ether to the recipient from the initiating external account.
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

async function processControllerTransferInit(event) {
  await updateWalletDiv()
  shouldUpdateWalletBlocks = true
  await startUpdatingWalletBlocks()
  createPopup(`Controller transfer initiated to ${event.args.newController}`)
}

async function processControllerTransferFinalized(event) {
  await updateWalletDiv()
  shouldUpdateWalletBlocks = false
  createPopup(`Controller transfer finalized to ${event.args.newController}`)
}

async function processControllerTransferCancelled(event) {
  await updateWalletDiv()
  shouldUpdateWalletBlocks = false
  createPopup(`Controller transfer canceled to ${event.args.newController}`)
}

async function onClickInitControllerTransfer() {
  const typedData = signedTypedDataFromOwnerDiv.value
  await initControllerTransfer(typedData)
}

async function initControllerTransfer(typedData) {
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

async function onClickCancelControllerChange() {
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

async function onClickUpdateWallet() {
  await updateWalletDiv()
}

async function onClickUpdateAccount() {
  await getBalance()
  await updateAccounts()
}

async function updateWalletInfo() {
  walletInfo.address = wallet.address
  walletInfo.balance = await provider.getBalance(wallet.address)
  walletInfo.controller = await wallet.controller()
  walletInfo.pendingController = await wallet.pendingController()
  walletInfo.pendingControllerCommitBlock = parseInt(await wallet.pendingControllerCommitBlock())
  walletInfo.gracePeriodBlocks = parseInt(await wallet.gracePeriodBlocks())

  if (accounts[0].toLowerCase() === walletInfo.controller.toLowerCase()) {
    if (walletInfo.pendingController !== ethers.constants.AddressZero) {
      walletInfo.ownershipStatus = OwnershipStatus.OwnershipFromYou
    } else {
      walletInfo.ownershipStatus = OwnershipStatus.IsOwner
    }
    return
  }

  if (accounts[0].toLowerCase() === walletInfo.pendingController.toLowerCase()) {
    walletInfo.ownershipStatus = OwnershipStatus.OwnershipToYou
  } else {
    walletInfo.ownershipStatus = OwnershipStatus.IsNotOwner
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

async function updateAccounts() {
  try {
    const newAccounts = await ethereum.request({
      method: 'eth_accounts',
    })
    handleNewAccounts(newAccounts)
  } catch (err) {
    console.error('Error on init when getting accounts', err)
  }
}

const initialize = async () => {
  if (isMetaMaskInstalled()) {

    ethereum.autoRefreshOnNetworkChange = false

    getNetworkId()
    getBalance()

    ethereum.on('networkChanged', handleNewNetwork)
    ethereum.on('accountsChanged', handleNewAccounts)
    await updateAccounts();
  }

  walletDiv.style.visibility = "hidden"
  walletAddressToConnect.value = DeployInfo.walletAddress

  updateButtons()
}

// assign events
connectWalletButton.onclick = onClickConnectWallet
disconnectWalletButton.onclick = onClickDisconnectWallet
initControllerTransferButton.onclick = onClickInitControllerTransfer
finalizeControllerTransferButton.onclick = onClickFinalizeControllerTransfer
cancelControllerChangeButton.onclick = onClickCancelControllerChange
signedTypedDataFromOwnerDiv.onchange = onChangeSignedTypedDataFromOwner
sendIMToOracleButton.onclick = sendIMToOracle
getIMFromOracleButton.onclick = getIMFromOracle
sendEtherButton.onclick = onClickSendEther
signTypedData.onclick = onClickSignTypedData
updateWalletButton.onclick = onClickUpdateWallet
updateAccountButton.onclick = onClickUpdateAccount

window.addEventListener('DOMContentLoaded', initialize)


