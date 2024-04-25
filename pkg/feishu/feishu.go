package feishu

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

var ApiUrl = "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"

type ApiRequestText struct {
	MsgType string                `json:"msg_type"`
	Content ApiRequestTextContent `json:"content"`
}
type ApiRequestTextContent struct {
	Text string `json:"text"`
}

type ApiRequestPost struct {
	MsgType string                `json:"msg_type"`
	Content ApiRequestPostContent `json:"content"`
}
type ApiRequestPostContent struct {
	Post ApiRequestPostPost `json:"post"`
}
type ApiRequestPostPost struct {
	ZhCn ApiRequestPostZhCn `json:"zh_cn"`
}
type ApiRequestPostZhCn struct {
	Title   string                               `json:"title"`
	Content [][]ApiRequestPostContentPostContent `json:"content"`
}
type ApiRequestPostContentPostContent struct {
	Tag    string `json:"tag"`
	Text   string `json:"text,omitempty"`
	Href   string `json:"href,omitempty"`
	UserID string `json:"user_id,omitempty"`
}

type ApiResponse struct {
	Msg string `json:"msg"`
}

func SendText(msg string) (err error) {
	if msg == "" {
		return
	}

	method := "POST"

	var payload bytes.Buffer
	err = json.NewEncoder(&payload).Encode(ApiRequestText{
		MsgType: "text",
		Content: ApiRequestTextContent{
			Text: msg,
		},
	})
	if err != nil {
		return
	}

	client := http.Client{
		Transport: &http.Transport{
			Proxy: nil,
		},
	}
	req, err := http.NewRequest(method, ApiUrl, &payload)
	if err != nil {
		return
	}
	req.Header.Add("Content-Type", " application/json")

	res, err := client.Do(req)
	if err != nil {
		return
	}
	defer func(Body io.ReadCloser) {
		curlErr := Body.Close()
		if curlErr != nil {
			err = curlErr
		}
	}(res.Body)

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return
	}

	var response ApiResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		return
	}
	if response.Msg != "success" {
		err = errors.New(response.Msg)
		return
	}

	return
}

func SendPost(contentChild []ApiRequestPostContentPostContent, title string) (err error) {
	var content [][]ApiRequestPostContentPostContent
	content = append(content, contentChild)

	method := "POST"

	var payload bytes.Buffer
	err = json.NewEncoder(&payload).Encode(ApiRequestPost{
		MsgType: "post",
		Content: ApiRequestPostContent{
			Post: ApiRequestPostPost{
				ZhCn: ApiRequestPostZhCn{
					Title:   title,
					Content: content,
				},
			},
		},
	})
	if err != nil {
		return
	}

	client := http.Client{
		Transport: &http.Transport{
			Proxy: nil,
		},
	}
	req, err := http.NewRequest(method, ApiUrl, &payload)
	if err != nil {
		return
	}
	req.Header.Add("Content-Type", " application/json")

	res, err := client.Do(req)
	if err != nil {
		return
	}
	defer func(Body io.ReadCloser) {
		curlErr := Body.Close()
		if curlErr != nil {
			err = curlErr
		}
	}(res.Body)

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return
	}

	var response ApiResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		return
	}
	if response.Msg != "success" {
		err = errors.New(response.Msg)
		return
	}

	return
}
