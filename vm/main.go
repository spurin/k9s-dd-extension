package main

import (
	"flag"
	"github.com/labstack/echo"
	"log"
	"net"
	"net/http"
	"os"
)

func main() {
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

	router.POST("/createKubeConfigFile", createKubeConfigFile)

	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

type Payload struct {
	Data string `json:"data"`
}

func createKubeConfigFile(ctx echo.Context) error {
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
