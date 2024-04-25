package queue_test

import (
	"fmt"
	"go-hook/pkg/config"
	"go-hook/pkg/queue"
	"testing"
	"time"
)

func TestMain(m *testing.M) {
	fmt.Println("----------", time.Now().Format("2006-01-02 15:04:05"), "start", "----------")

	config.CFG = config.NewConfig()
	config.DB, _ = config.NewDB(config.CFG)

	m.Run()

	fmt.Println("----------", time.Now().Format("2006-01-02 15:04:05"), "end", "----------")
}

func TestPushCallWxVideo(t *testing.T) {
	wechatID := "lennon7c7"
	err := queue.PushCallWxVideo(wechatID)
	if err != nil {
		t.Error(err)
		return
	}
}

func TestPopCallWxVideo(t *testing.T) {
	_, err := queue.PopCallWxVideo()
	if err != nil {
		t.Error(err)
		return
	}
}
