package eth

import (
	"context"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/pkg/errors"
)

var (
	ErrReceiptNotReceived = errors.New("receipt not available")
)

type Client struct {
	client *ethclient.Client
	Config *ClientConfig
}

type ClientConfig struct {
	ReceiptTimeout         time.Duration `json:"receipt_timeout"`
	ConfirmationTimeout    time.Duration `json:"confirmation_timeout"`
	ConfirmationBlockCount int64         `json:"confirmation_block_count"`
	DefaultGasLimit        int           `json:"default_gas_limit"`
	MinGasPrice            *big.Int      `json:"min_gas_price"`
	MaxGasPrice            *big.Int      `json:"max_gas_price"`
	RPCResponseTimeout     time.Duration `json:"rpc_response_time_out"`
	WaitReceiptCycleTime   time.Duration `json:"wait_receipt_cycle_time_out"`
	WaitBlockCycleTime     time.Duration `json:"wait_block_cycle_time_out"`
}

func (c *Client) BlockByNumber(ctx context.Context, number *big.Int) (*types.Block, error) {
	_ctx, cancel := context.WithTimeout(ctx, c.Config.RPCResponseTimeout)
	defer cancel()
	block, err := c.client.BlockByNumber(_ctx, number)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	return block, nil
}

func (c *Client) HeaderByNumber(ctx context.Context, number *big.Int) (*types.Header, error) {
	_ctx, cancel := context.WithTimeout(ctx, c.Config.RPCResponseTimeout)
	defer cancel()
	header, err := c.client.HeaderByNumber(_ctx, number)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	return header, nil
}

func (c *Client) GetTransactionReceiptByID(ctx context.Context, txID string) (*types.Receipt, error) {
	_ctx, cancel := context.WithTimeout(ctx, c.Config.RPCResponseTimeout)
	defer cancel()
	receipt, err := c.client.TransactionReceipt(_ctx, common.HexToHash(txID))
	if err != nil {
		return nil, errors.WithStack(err)
	}

	if receipt == nil {
		log.Println("Pending transaction", "tx", txID)
		return nil, ErrReceiptNotReceived
	}
	return receipt, nil
}

func (c *Client) WaitTransactionReceiptByID(ctx context.Context, txID string) (*types.Receipt, error) {
	return c.waitReceipt(ctx, common.HexToHash(txID), c.Config.ReceiptTimeout)
}

func (c *Client) WaitForBlock(ctx context.Context, confirmationBlock *big.Int) error {
	return c.waitBlock(ctx, c.Config.ConfirmationTimeout, confirmationBlock)
}

func (c *Client) GetTransactionByID(ctx context.Context, txID string) (*types.Transaction, bool, error) {
	return c.client.TransactionByHash(ctx, common.HexToHash(txID))
}

func (c *Client) waitBlock(ctx context.Context, timeout time.Duration, confirmationBlock *big.Int) error {
	var err error
	var blockNumber *big.Int

	start := time.Now()
	for {
		blockNumber, err = c.CurrentBlock(ctx)
		if err != nil {
			log.Println(errors.Wrap(err, "couldn't get the current block number"))
			break
		}
		if time.Since(start) >= timeout {
			err = errors.New("time out error during block number fetch")
			break
		}
		if blockNumber.Cmp(confirmationBlock) == 1 {
			break
		}

		time.Sleep(c.Config.WaitBlockCycleTime)
	}

	if err != nil {
		return err
	}

	if blockNumber == nil {
		return errors.New("couldn't fetch block number")
	}
	return nil
}

func (c *Client) CurrentBlock(ctx context.Context) (*big.Int, error) {
	_ctx, cancel := context.WithTimeout(ctx, c.Config.RPCResponseTimeout)
	defer cancel()
	header, err := c.client.HeaderByNumber(_ctx, nil)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	return header.Number, nil
}

func (c *Client) waitReceipt(ctx context.Context, txID common.Hash, timeout time.Duration) (*types.Receipt, error) {
	var err error
	var receipt *types.Receipt

	log.Println("Waiting for receipt", "tx", txID.Hex())

	start := time.Now()
	for {
		receipt, err = c.client.TransactionReceipt(ctx, txID)
		if err != nil {
			log.Println("get transaction receipt: ", err)
		}

		if receipt != nil || time.Since(start) >= timeout {
			break
		}

		time.Sleep(c.Config.WaitReceiptCycleTime)
	}

	if receipt == nil {
		log.Println("Pending transaction / Wait receipt timeout", "tx", txID.Hex())
		return receipt, ErrReceiptNotReceived
	}
	log.Println("Receipt received", "tx", txID.Hex())

	return receipt, err
}
