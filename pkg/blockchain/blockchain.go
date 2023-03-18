package blockchain

import (
	"context"
	"crypto/ecdsa"
	"log"
	"math/big"

	"digital-assets-inheritance-demo/pkg/config"
	"digital-assets-inheritance-demo/pkg/eth"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/pkg/errors"
)

type ETHClient interface {
	GetTransactionReceiptByID(ctx context.Context, txID string) (*types.Receipt, error)
	WaitTransactionReceiptByID(ctx context.Context, txID string) (*types.Receipt, error)
	CurrentBlock(ctx context.Context) (*big.Int, error)
	BlockByNumber(ctx context.Context, number *big.Int) (*types.Block, error)
	HeaderByNumber(ctx context.Context, number *big.Int) (*types.Header, error)
	WaitForBlock(ctx context.Context, confirmationBlock *big.Int) error
}

// TransactionService blockchain tx service
type TransactionService struct {
	client                 ETHClient
	confirmationBlockCount int64
}

//// NewTransactionService new transaction service
//func NewTransactionService(_client ETHClient, confirmationBlockCount int64) (*TransactionService, error) {
//	return &TransactionService{client: _client, confirmationBlockCount: confirmationBlockCount}, nil
//}

func PublishMessage(hub *eth.Hub, message string, cfg *config.Config) error {
	ctx := context.Background()

	privateKey, err := crypto.HexToECDSA(cfg.Ethereum.SignerPrivateKey)
	if err != nil {
		log.Fatal(err)
	}
	publicKey := privateKey.Public()
	address := crypto.PubkeyToAddress(*publicKey.(*ecdsa.PublicKey))
	signer := types.NewLondonSigner(big.NewInt(31337))
	signerFn := func(a common.Address, tx *types.Transaction) (*types.Transaction, error) {
		if a != address {
			return nil, errors.New("Not authorized to sign this account")
		}
		return types.SignTx(tx, signer, privateKey)
	}

	txOpts := &bind.TransactOpts{
		From:     address,
		Nonce:    nil,
		Signer:   signerFn,
		Value:    big.NewInt(0),
		GasPrice: cfg.Ethereum.MaxGasPrice,
		GasLimit: cfg.Ethereum.MaxGasLimit,
		Context:  ctx,
		NoSend:   false,
	}

	heirAddressHex := "0x00"
	heirAddress := common.HexToAddress(heirAddressHex)

	tx, err := hub.Publish(txOpts, heirAddress, message)
	if err != nil {
		log.Fatal(err)
	}

	println("Transaction hash: ", tx.Hash().Hex())
	return nil
}

func RealMessagePublishedEvents(hub *eth.Hub, cfg *config.Config) error {
	ctx := context.Background()

	end := uint64(2394201)

	fo := &bind.FilterOpts{
		Start:   0,
		End:     &end,
		Context: ctx,
	}

	logs, err := hub.HubFilterer.FilterMessagePublished(fo, []common.Address{})
	if err != nil {
		log.Fatal(err)
	}

	for logs.Next() {
		println("Message published: ", logs.Event.Message)
	}

	return nil
}
