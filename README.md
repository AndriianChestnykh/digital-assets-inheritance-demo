## Purpose

The app represents a Proof-of-Concept of digital assets inheritance protocol. It allows a safe and secure inheritance between self-custody users without any intermediaries.

It is based on the Ethereum blockchain and uses the Hardhat framework for development and testing. The app is a set of smart contracts, which are deployed on the local blockchain. The app is a Proof-of-Concept, so it is not intended to be used in production.  

## To run the demo

```
npm run hardhat:node
npm run hardhat:deploy
npm run start:owner
npm run start:heir
```
### Optionally
Build and run the Oracle in the ```dapps/oracle``` folder to simplify the Owner-Heir communication.
Install the browser extension of transactions interseptor, which will forward some transactions to the Wallet smart contract

[![Demo video]({./Screenshot.png})] ({https://youtu.be/8OJOFUVqDZs} "Demo video")
