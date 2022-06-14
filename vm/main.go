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
	log.Println("Starting listening on %s\n", socketPath)
	router := echo.New()
	router.HideBanner = true

	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		log.Fatal(err)
	}
	router.Listener = ln

	router.GET("/hello", hello)

	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func hello(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: "hello"})
}

type HTTPMessageBody struct {
	Message string
}
