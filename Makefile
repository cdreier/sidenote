LINKERFLAGS = -X main.Version=`git describe --tags --always --long --dirty` -X main.BuildTimestamp=`date -u '+%Y-%m-%d_%I:%M:%S_UTC'`

test:
	go test -tags sndev ./... -cover -coverprofile=coverage.txt

coverage:
	make test -tags sndev
	go tool cover -html=coverage.txt

run:
	go run -tags sndev . -dev -noauth

build:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -tags snbin -o main -ldflags "$(LINKERFLAGS)"

build_mac:
	GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -tags snbin -o main -ldflags "$(LINKERFLAGS)"

build_win:
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -tags snbin -o main.exe -ldflags "$(LINKERFLAGS)"

install:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go install -tags standalone -ldflags "$(LINKERFLAGS)"

standalone_build:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -tags standalone -o sidenote_standalone_linux -ldflags "$(LINKERFLAGS)"

standalone_build_mac:
	GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -tags standalone -o sidenote_standalone_mac -ldflags "$(LINKERFLAGS)"

standalone_build_m1:
	GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -tags standalone -o sidenote_standalone_m1 -ldflags "$(LINKERFLAGS)"

standalone_build_win:
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -tags standalone -o sidenote_standalone.exe -ldflags "$(LINKERFLAGS)"

lint:
	golint ./...
