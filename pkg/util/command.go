package util

import (
	"os/exec"
)

func CommandOpen(str string) (err error) {
	cmd := exec.Command("cmd", "/c start "+str)
	err = cmd.Run()
	if err != nil {
		return
	}

	return
}
