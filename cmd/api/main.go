package main

import "go-hook/pkg/core"

// go env -w GOARCH=amd64; go env -w GOOS=windows; go build -o .\cmd\api\api.exe .\cmd\api\main.go
// go env -w GOARCH=amd64; go env -w GOOS=linux; go build -o .\cmd\api\api .\cmd\api\main.go
func main() {
	core.Core()
}
