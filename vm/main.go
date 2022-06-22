package main

import (
	"flag"
	"github.com/labstack/echo"
	"log"
	"math/rand"
	"net"
	"net/http"
	"os"
	"time"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func main() {
	rand.Seed(time.Now().UnixNano())
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest/volumes-service.sock", "Unix domain socket to listen on")
	flag.Parse()

	err := os.RemoveAll(socketPath)
	if err != nil {
		return
	}

	log.Printf("Starting listening on %s\n", socketPath)
	router := echo.New()
	router.HideBanner = true
	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		log.Fatal(err)
	}

	router.Listener = ln
	router.POST("/store-kube-config", storeKubeConfig)
	router.POST("/store-values", storeValues)
	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

type Payload struct {
	Data string `json:"data"`
}

// storeKubeConfig stores the kubeconfig from the request in the container filesystem
func storeKubeConfig(ctx echo.Context) error {
	payload := &Payload{}
	if err := ctx.Bind(payload); err != nil {
		return err
	}
	const kubeConfigFilePath = "/root/.kube/config"
	data := []byte(payload.Data)
	err := os.WriteFile(kubeConfigFilePath, data, 0644)
	if err != nil {
		panic(err)
	}
	return ctx.JSON(http.StatusCreated, kubeConfigFilePath)
}

// storeKubeConfig stores the kubeconfig from the request in the container filesystem
func storeValues(ctx echo.Context) error {
	payload := &Payload{}
	if err := ctx.Bind(payload); err != nil {
		return err
	}
	filePath := "/tmp/" + randSeq(10)
	data := []byte(payload.Data)
	err := os.WriteFile(filePath, data, 0644)
	if err != nil {
		panic(err)
	}
	return ctx.JSON(http.StatusCreated, filePath)
}
