package file_test

import (
	"fmt"
	"go-hook/pkg/file"
	"testing"
	"time"
)

func TestMain(m *testing.M) {
	fmt.Println("----------", time.Now().Format("2006-01-02 15:04:05"), "start", "----------")

	m.Run()

	fmt.Println("----------", time.Now().Format("2006-01-02 15:04:05"), "end", "----------")
}

// go test -v pkg/file/file_test.go
func TestGetFileList(t *testing.T) {
	pathName := "../../images/test/1"
	files := file.GetFiles(pathName)
	for _, f := range files {
		fmt.Println(f)
	}
}

// go test -v pkg/file/file_test.go -run TestGetRedirectUrl
func TestGetRedirectUrl(t *testing.T) {
	input := "https://www.xgmn02.com/uploadfile/202205/28/FF13279573.jpg"
	output := file.GetRedirectUrl(input)

	expect := "1https://j.20dh.top/Uploadfile/202205/28/FF13279573.jpg"
	if expect != output {
		t.FailNow()
	}
}
