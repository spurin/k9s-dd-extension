package main

import (
	"flag"
	"fmt"
	"github.com/labstack/echo"
	"log"
	"net"
	"net/http"
	"os"
)

type (
	VCluster struct {
		Name      string `json:"name"`
		Namespace string `json:"namespace"`
	}
)

var (
	vClusters = map[string]*VCluster{}

	// kubernetes in DD
	// kubeconfig
	count = 0
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
	//router.GET("/vClusters", getAllVClusters)
	//router.GET("/vClusters/:id", getVCluster)
	router.POST("/vClusters", createVCluster)
	//router.DELETE("/vClusters/:id", deleteVCluster)

	log.Fatal(router.Start(startURL))
}

func getVCluster(ctx echo.Context) error {
	name := ctx.Param("name")

	return ctx.JSON(http.StatusOK, vClusters[name])
}

func getAllVClusters(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, vClusters)
}

func createVCluster(ctx echo.Context) error {
	log.Println("count")
	vCluster := &VCluster{}
	if err := ctx.Bind(vCluster); err != nil {
		return err
	}
	vClusters[vCluster.Name] = vCluster
	fmt.Println("vCluster : ", vCluster)
	return ctx.JSON(http.StatusCreated, vCluster)
}

func deleteVCluster(ctx echo.Context) error {
	name := ctx.Param("name")
	delete(vClusters, name)
	return ctx.NoContent(http.StatusNoContent)
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func hello(ctx echo.Context) error {
	count = count + 1
	log.Println(count)
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: "hello boss" + string(count)})
}

type HTTPMessageBody struct {
	Message string
}
