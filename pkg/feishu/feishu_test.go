package feishu_test

import (
	"fmt"
	"go-hook/pkg/feishu"
	"testing"
	"time"
)

func TestMain(m *testing.M) {
	fmt.Println("----------", time.Now().Format("2006-01-02 15:04:05"), "start", "----------")

	m.Run()

	fmt.Println("----------", time.Now().Format("2006-01-02 15:04:05"), "end", "----------")
}

func TestSend(t *testing.T) {
	msg := "hi\njust a test"
	err := feishu.SendText(msg)
	if err != nil {
		fmt.Println(err)
	}
}

func TestSendPost(t *testing.T) {
	var contentChild []feishu.ApiRequestPostContentPostContent
	contentChild = append(contentChild, feishu.ApiRequestPostContentPostContent{
		Tag:  "text",
		Text: "项目有更新: ",
	})
	contentChild = append(contentChild, feishu.ApiRequestPostContentPostContent{
		Tag:  "a",
		Text: "请查看",
		Href: "https://www.baidu.com/",
	})
	title := ""
	err := feishu.SendPost(contentChild, title)
	if err != nil {
		fmt.Println(err)
	}
}
