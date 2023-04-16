package sidenote_ui

import "embed"

//go:embed production/dist/*
var Build embed.FS

//go:embed public/*
var PublicForDev embed.FS
