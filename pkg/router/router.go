package router

import (
	"github.com/gin-gonic/gin"
	"go-hook/pkg/config"
	"go-hook/pkg/queue"
	"go-hook/pkg/util"
)

func NewRouter(router *gin.Engine, config *config.Config) {
	for k, v := range config.Static {
		router.StaticFile(k, v)
	}
	router.Static("/static", "./static")
	router.Static(config.File.WebRelativePath, config.File.WebUploadRoot) //文件访问

	router.GET("/ping", RouterPing)

	router.POST("/queue", queue.RoutePush)
	router.GET("/queue", queue.RouteQuery)
	router.DELETE("/queue", queue.RouteDelete)
	router.GET("/queue-pop", queue.RoutePop)
}

func RouterPing(c *gin.Context) {
	util.OK(c, "pong", nil)
}
