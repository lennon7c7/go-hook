package file

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

func GetNameWithoutExt() string {
	_, fullFilename, _, _ := runtime.Caller(1)
	//获取文件名带后缀
	filenameWithSuffix := path.Base(fullFilename)
	//获取文件后缀
	fileSuffix := path.Ext(filenameWithSuffix)
	//获取文件名
	filenameOnly := strings.TrimSuffix(filenameWithSuffix, fileSuffix)

	return filenameOnly
}

func GetFiles(pathName string) (files []string) {
	err := filepath.Walk(pathName, func(pathFile string, info os.FileInfo, err error) error {
		if pathName == pathFile {
			return nil
		}

		files = append(files, pathFile)
		return nil
	})

	if err != nil {
		fmt.Println(err)
		return
	}

	return
}

func SerialRename(files []string) {
	timeNow := time.Now().Format("20060102150405")

	var tempFiles []string
	for key, value := range files {
		// path.Base(pathString)函数,pathString的值必须为linux风格的路径，即 "/" 才能够正常的获取最后的路径段的值。在如果路径是windows风格的，需要使用 pathfile.ToSlash()函数，将路径转为linux风格
		value = filepath.ToSlash(value)
		fileSuffix := path.Ext(value)
		newpath := path.Dir(value) + "/" + timeNow + "-" + fmt.Sprintf("%04d", key) + fileSuffix
		err := os.Rename(value, newpath)
		if err != nil {
			fmt.Println(err)
			continue
		}

		tempFiles = append(tempFiles, newpath)
	}

	for key, value := range tempFiles {
		fileSuffix := path.Ext(value)
		newpath := path.Dir(value) + "/" + fmt.Sprintf("%04d", key) + fileSuffix
		err := os.Rename(value, newpath)
		if err != nil {
			fmt.Println(err)
			continue
		}
	}

	return
}

func Exists(path string) bool {
	_, err := os.Stat(path)

	return !os.IsNotExist(err)
}

func IsDir(path string) bool {
	fileInfo, err := os.Stat(path)
	if err != nil {
		// error handling
		return false
	}

	return fileInfo.IsDir()
}

func GetRedirectUrl(oldUrl string) (newUrl string) {
	client := http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Timeout: 30 * time.Second,
	}
	resp, err := client.Get(oldUrl)
	if err != nil {
		fmt.Println(err)
		newUrl = oldUrl
		return
	}

	newUrl = resp.Header.Get("location")
	if newUrl == "" {
		newUrl = oldUrl
		return
	}

	return
}

func Create(fileName string, fileContent any) (err error) {
	filePath := path.Dir(fileName)
	if !Exists(filePath) {
		err = os.MkdirAll(filePath, os.ModePerm)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	outputFile, _ := os.OpenFile(fileName, os.O_CREATE|os.O_RDWR|os.O_TRUNC, os.ModePerm)
	defer func(outputFile *os.File) {
		err = outputFile.Close()
		if err != nil {
			return
		}
	}(outputFile)
	encoder := json.NewEncoder(outputFile)
	err = encoder.Encode(fileContent)
	if err != nil {
		return
	}

	return
}

func CreateHtml(fileName string, fileContent string) (err error) {
	//创建一个新文件，写入内容
	filePath := fileName
	file, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return
	}
	//及时关闭
	defer func(file *os.File) {
		_ = file.Close()
	}(file)
	//写入时，使用带缓存的 *Writer
	writer := bufio.NewWriter(file)
	_, err = writer.WriteString(fileContent)
	if err != nil {
		return
	}
	//因为 writer 是带缓存的，因此在调用 WriterString 方法时，内容是先写入缓存的
	//所以要调用 flush方法，将缓存的数据真正写入到文件中。
	err = writer.Flush()
	if err != nil {
		return
	}

	return
}

func CreateJson(fileName string, fileContent string) (err error) {
	_ = os.Remove(fileName)

	//创建一个新文件，写入内容
	filePath := fileName
	file, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return
	}
	//及时关闭
	defer func(file *os.File) {
		_ = file.Close()
	}(file)
	//写入时，使用带缓存的 *Writer
	writer := bufio.NewWriter(file)
	_, err = writer.WriteString(fileContent)
	if err != nil {
		return
	}
	//因为 writer 是带缓存的，因此在调用 WriterString 方法时，内容是先写入缓存的
	//所以要调用 flush方法，将缓存的数据真正写入到文件中。
	err = writer.Flush()
	if err != nil {
		return
	}

	return
}
