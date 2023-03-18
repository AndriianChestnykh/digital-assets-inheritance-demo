package config

import (
	"fmt"
	"math/big"
	"os"
	"time"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Ethereum struct {
		URL                    string        `yaml:"url" envconfig:"ETH_URL"`
		ReceiptTimeout         time.Duration `yaml:"receiptTimeout" envconfig:"ETH_RECEIPT_TIMEOUT"`
		ConfirmationTimeout    time.Duration `yaml:"confirmationTimeout" envconfig:"ETH_CONFIRMATION_TIMEOUT"`
		ConfirmationBlockCount int64         `yaml:"confirmationBlockCount" envconfig:"ETH_CONFIRMATION_BLOCK_COUNT"`
		DefaultGasLimit        int           `yaml:"defaultGasLimit" envconfig:"ETH_DEFAULT_GAS_LIMIT"`
		MinGasPrice            *big.Int      `yaml:"minGasPrice" envconfig:"ETH_MIN_GAS_PRICE"`
		MaxGasPrice            *big.Int      `yaml:"maxGasPrice" envconfig:"ETH_MAX_GAS_PRICE"`
		MaxGasLimit            uint64        `yaml:"maxGasLimit" envconfig:"ETH_MAX_GAS_LIMIT"`
		RPCResponseTimeout     time.Duration `yaml:"rpcResponseTimeout" envconfig:"ETH_RPC_RESPONSE_TIMEOUT"`
		WaitReceiptCycleTime   time.Duration `yaml:"waitReceiptCycleTime" envconfig:"ETH_WAIT_RECEIPT_CYCLE_TIME"`
		WaitBlockCycleTime     time.Duration `yaml:"waitBlockCycleTime" envconfig:"ETH_WAIT_BLOCK_CYCLE_TIME"`
		HubContractAddress     string        `yaml:"hubContractAddress" envconfig:"ETH_HUB_CONTRACT_ADDRESS"`
		SignerPrivateKey       string        `yaml:"signerPrivateKey" envconfig:"ETH_SIGNER_PRIVATE_KEY"`
	} `yaml:"ethereum"`
	Scheduler struct {
		PublishStateTimer time.Duration `yaml:"publishStateTimer" envconfig:"PUBLISH_STATE_TIMER"`
	} `yaml:"scheduler"`
}

func ParseConfig() (*Config, error) {
	var cfg Config
	readFile(&cfg)
	readEnv(&cfg)
	return &cfg, nil
}

func readFile(cfg *Config) {
	f, err := os.Open("config.yml")
	if err != nil {
		processError(err)
	}
	defer func(f *os.File) {
		err := f.Close()
		if err != nil {
			processError(err)
		}
	}(f)

	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(cfg)
	if err != nil {
		processError(err)
	}
}

func readEnv(cfg *Config) {
	err := envconfig.Process("", cfg)
	if err != nil {
		processError(err)
	}
}

func processError(err error) {
	fmt.Println(err)
	os.Exit(2)
}
