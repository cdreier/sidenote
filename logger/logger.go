package logger

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

var _logger *zap.SugaredLogger

type ContextKey int

const LoggerContextKey ContextKey = iota

// init will be executed when the package is loaded
func init() {
	loggerConfig := zap.NewProductionConfig()
	logger, _ := loggerConfig.Build()
	_logger = logger.Sugar()
}

// EnableDevelopmentLogger constructs a development logger and overwrites the default production logger.
func EnableDevelopmentLogger() {
	loggerConfig := zap.NewDevelopmentConfig()
	logger, _ := loggerConfig.Build()
	_logger = logger.Sugar()
}

// Get returns the current default SugaredLogger.
func Get() *zap.SugaredLogger {
	return _logger
}

// FromRequest extracts the request scoped logger from the request.
// If no logger is found in the context, the default logger is returned.
func FromRequest(r *http.Request) *zap.SugaredLogger {
	return FromContext(r.Context())
}

// FromContext extracts the request scoped logger from the context.
// If no logger is found in the context, the default logger is returned.
func FromContext(ctx context.Context) *zap.SugaredLogger {
	l, ok := ctx.Value(LoggerContextKey).(*zap.SugaredLogger)
	if !ok {
		return _logger
	}
	return l
}

// AddLoggerToContext returns a new context with the specified logger added.
// If ctx already contains a logger, it will be overwritten.
func AddLoggerToContext(ctx context.Context, logger *zap.SugaredLogger) context.Context {
	return context.WithValue(ctx, LoggerContextKey, logger)
}

func getRequestID(r *http.Request) string {
	return fmt.Sprintf("%v", r.Context().Value(middleware.RequestIDKey))
}

// RequestIDMiddleware adds a request ID to the current logger.
func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := getRequestID(r)
		ctx := AddLoggerToContext(r.Context(), _logger.With(
			"requestID", requestID,
		))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
