package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"digital-assets-inheritance-demo/pkg/blockchain"
	"digital-assets-inheritance-demo/pkg/config"
	db2 "digital-assets-inheritance-demo/pkg/db"
	"digital-assets-inheritance-demo/pkg/eth"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/go-co-op/gocron"
)

func main() {
	cfg, err := config.ParseConfig()
	if err != nil {
		panic(err)
	}

	hub, err := initHub(cfg)
	if err != nil {
		log.Fatal("Error initializing hub: ", err)
	}

	s := gocron.NewScheduler(time.UTC)
	s.TagsUnique()

	//_, err = s.Every(cfg.Scheduler.PublishStateTimer).SingletonMode().
	//	Do(blockchain.PublishMessage, hub, "test message!!", cfg)
	//if err != nil {
	//	log.Fatal("Error initializing publishing job: ", err)
	//}

	_, err = s.Every(cfg.Scheduler.PublishStateTimer).SingletonMode().
		Do(blockchain.ReadMessagePublishedEvents, hub, cfg)
	if err != nil {
		log.Fatal("Error initializing read hub events job: ", err)
	}

	s.StartAsync()

	db := db2.New()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		switch r.Method {
		case http.MethodGet:
			_, err := fmt.Fprintf(w, db.Get())
			if err != nil {
				return
			}
			log.Println("Data requested successfully")
		case http.MethodPost:
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "Failed to read request", http.StatusInternalServerError)
				return
			}
			db.Set(string(body))

			w.WriteHeader(http.StatusOK)
			log.Println("Data saved successfully:\n " + string(body))
		default:
			_, err := fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
			if err != nil {
				return
			}
		}
	})

	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Error starting http server: ", err)
	}

	// graceful shut down
	//done := make(chan os.Signal, 1)
	//signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)
	//select {
	//case <-done:
	//}

	//s.Stop()
}

func initHub(cfg *config.Config) (*eth.Hub, error) {
	ec, err := ethclient.Dial(string(cfg.Ethereum.URL))
	if err != nil {
		return nil, fmt.Errorf("failed connect to eth node %s: %s", cfg.Ethereum.URL, err.Error())
	}
	hub, err := eth.NewHub(common.HexToAddress(cfg.Ethereum.HubContractAddress), ec)
	if err != nil {
		return nil, fmt.Errorf("error failed create state contract client: %s", err.Error())
	}

	return hub, nil
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
