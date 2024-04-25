package queue

import (
	"errors"
	"go-hook/pkg/config"
	"go-hook/pkg/log"
	"time"
)

type Queue struct {
	Id         int    `gorm:"id" json:"id"`                 // ID
	Title      string `gorm:"title" json:"title"`           // 标题
	Data       string `gorm:"data" json:"data"`             // 数据
	Createtime int64  `gorm:"createtime" json:"createtime"` // 创建时间
}

func Push(title, data string) (err error) {
	if title == "" {
		err = errors.New("title is empty")
		return
	}

	if data == "" {
		err = errors.New("data is empty")
		return
	}

	queue := Queue{
		Title:      title,
		Data:       data,
		Createtime: time.Now().Unix(),
	}

	err = config.DB.Create(&queue).Error
	if err != nil {
		log.Error(err, title, data)
		return
	}

	return
}

func Query(id int) (queue Queue, err error) {
	if id == 0 {
		err = errors.New("id is empty")
		return
	}

	err = config.DB.
		Find(&queue, id).Error
	if err != nil {
		log.Error(err)
		return
	}

	return
}

func Pop(title string) (queue Queue, err error) {
	err = config.DB.
		Where(Queue{Title: title}).
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

	return
}
