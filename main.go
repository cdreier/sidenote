package main

import (
	"fmt"
	"html/template"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"drailing.net/sidenote/content"
	"drailing.net/sidenote/graphs"
	"drailing.net/sidenote/logger"
	"drailing.net/sidenote/search"
	"drailing.net/sidenote/server"
	"drailing.net/sidenote/storage"
	"github.com/urfave/cli/v2"
)

var (
	standalone = false

	Version        = "Unknown Version"
	BuildTimestamp = ""
)

func main() {

	app := cli.NewApp()
	app.Name = "ionos-dbaas-rest-api"
	app.Action = run
	app.Version = Version
	app.Commands = []*cli.Command{
		{
			Name:   "dump",
			Action: dump,
		},
		{
			Name:   "login",
			Action: login,
		},
	}
	app.Flags = []cli.Flag{
		&cli.StringFlag{
			Name:    "port",
			EnvVars: []string{"PORT"},
			Value:   "8080",
			Usage:   "port to start the API server on",
		},
		&cli.StringFlag{
			Name:    "dir",
			Aliases: []string{"data", "data_dir"},
			EnvVars: []string{"DIR", "DATA_DIR"},
			Value:   "data",
			Usage:   "this is the directory, where all data is stored",
		},
		&cli.BoolFlag{
			Name:    "dev",
			EnvVars: []string{"DEV"},
			Value:   false,
			Usage:   "dev mode",
		},
		&cli.BoolFlag{
			Name:    "noauth",
			EnvVars: []string{"NO_AUTH"},
			Value:   false,
			Usage:   "use the app without authorization",
		},
		&cli.StringFlag{
			Name:     "auth_authority",
			EnvVars:  []string{"AUTH_AUTHORITY"},
			Usage:    "authority server to connect to",
			Required: false,
		},
		&cli.StringFlag{
			Name:     "auth_client_id",
			EnvVars:  []string{"AUTH_CLIENT_ID"},
			Usage:    "client id for the auth server",
			Required: false,
		},
		&cli.StringFlag{
			Name:     "auth_redirect_uri",
			EnvVars:  []string{"AUTH_REDIRECT_URI"},
			Usage:    "redirect url",
			Required: false,
		},
		&cli.StringFlag{
			Name:     "auth_post_logout_uri",
			EnvVars:  []string{"AUTH_POST_LOGOUT_URI"},
			Value:    "http://localhost:8080/",
			Usage:    "post logout url",
			Required: false,
		},
		&cli.StringFlag{
			Name:    "root_url",
			EnvVars: []string{"ROOT_URL"},
			Value:   "http://localhost:8080/",
			Usage:   "post logout url",
		},
	}

	if err := app.Run(os.Args); err != nil {
		logger.Get().Fatalw("unable to start server", "err", err)
	}

}

func run(c *cli.Context) error {

	se := search.NewSearch(c.String("dir"))
	db := storage.NewStorage(c.String("dir"))
	defer db.Close()

	contentModule := content.NewContents(db, se)
	graphModule := graphs.NewGraphs(db)

	modules := make(map[string]server.ServerModule)
	modules["/content"] = contentModule
	modules["/search"] = se
	modules["/network"] = graphModule

	s := server.New(c.String("port"), server.ServerConfig{
		Dev:     c.Bool("dev") || standalone,
		NoAuth:  c.Bool("noauth") || standalone,
		Version: c.App.Version,
		Auth: server.AuthConfig{
			AuthAuthority:     template.URL(c.String("auth_authority")),
			AuthClientID:      c.String("auth_client_id"),
			AuthRedirectUri:   template.URL(c.String("auth_redirect_uri")),
			AuthPostLogoutUri: template.URL(c.String("auth_post_logout_uri")),
		},
		RootURL: strings.TrimSuffix(c.String("root_url"), "/"),
	}, modules)

	if standalone {
		openBrowser("http://localhost:" + c.String("port"))
	}

	return s.ListenAndServe()
}

func login(c *cli.Context) error {
	return nil
}

func dump(c *cli.Context) error {
	log.Println("TODO")
	return nil
}

func openBrowser(url string) {
	var err error

	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	if err != nil {
		log.Fatal(err)
	}
}

// docker run -e DSN=memory oryd/hydra:v1.9.2-sqlite serve all
