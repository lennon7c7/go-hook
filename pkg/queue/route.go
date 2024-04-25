package queue

import (
	"errors"
	"github.com/gin-gonic/gin"
	"go-hook/pkg/config"
	"go-hook/pkg/log"
	"go-hook/pkg/util"
	"time"
)

func RoutePush(c *gin.Context) {
	var queue Queue
	err := c.BindJSON(&queue)
	if err != nil {
		log.Error(err, queue)
		util.ErrorBusiness(c, err.Error())
		return
	}

	if queue.Title == "" {
		err = errors.New("title is empty")
		log.Error(err, queue)
		util.ErrorBusiness(c, err.Error())
		return
	}

	if queue.Data == "" {
		err = errors.New("data is empty")
		log.Error(err, queue)
		util.ErrorBusiness(c, err.Error())
		return
	}

	queue.Createtime = time.Now().Unix()
	err = config.DB.Create(&queue).Error
	if err != nil {
		log.Error(err, queue)
		util.ErrorBusiness(c, err.Error())
		return
	}

	util.OK(c, "", queue)
}

func RouteQuery(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		err := errors.New("id is empty")
		log.Error(err)
		util.ErrorBusiness(c, err.Error())

		return
	}

	var queue Queue
	err := config.DB.
		Find(&queue, id).Error
	if err != nil {
		log.Error(err, id)
		return
	}

	if queue.Id == 0 {
		err := errors.New("no data")
		log.Error(err)
		util.ErrorBusiness(c, err.Error())

		return
	}

	util.OK(c, "", queue)
}

func RouteDelete(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		err := errors.New("id is empty")
		log.Error(err)
		util.ErrorBusiness(c, err.Error())

		return
	}

	var queue Queue
	err := config.DB.
		Find(&queue, id).Error
	if err != nil {
		log.Error(err, id)
		return
	}

	if queue.Id > 0 {
		err = config.DB.Delete(&queue).Error
		if err != nil {
			log.Error(err)
			return
		}
	}

	util.OK(c, "", nil)
}

func RoutePop(c *gin.Context) {
	var queue Queue
	err := config.DB.
		Order("id").
		Limit(1).
		Find(&queue).Error
	if err != nil {
		log.Error(err)
		return
	}

	if queue.Id > 0 {
		err = config.DB.Delete(&queue).Error
		if err != nil {
			log.Error(err)
			return
		}
	}

	util.OK(c, "", queue)
}
