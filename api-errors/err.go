package apierrors

import (
	"strings"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	en_translations "github.com/go-playground/validator/v10/translations/en"
)

var validate *validator.Validate

// errorMessages is the translator to translate the messages to customer friendly messages
var errorMessages ut.Translator

func init() {

	en := en.New()
	uni := ut.New(en, en)
	errorMessages, _ = uni.GetTranslator("en")

	validate = validator.New()
	en_translations.RegisterDefaultTranslations(validate, errorMessages)
}

type ApiError struct {
	Errors []ValidationErrorMessage `json:"errors,omitempty"`
}

type ValidationErrorMessage struct {
	Err validator.FieldError `json:"-"`
	Msg string               `json:"msg,omitempty"`
}

func (e *ApiError) Error() string {
	errs := make([]string, 0)
	for _, e := range e.Errors {
		errs = append(errs, e.Msg)
	}
	return strings.Join(errs, ", ")
}

// func (err *ApiError) MarshalJSON() ([]byte, error) {

// }

func NewApiError(errs validator.ValidationErrors) *ApiError {
	err := new(ApiError)
	err.Errors = make([]ValidationErrorMessage, 0)
	for _, e := range errs {
		err.Errors = append(err.Errors, ValidationErrorMessage{
			Err: e,
			Msg: e.Translate(errorMessages),
		})
	}
	return err
}

func ValidateStruct(in interface{}) error {
	err := validate.Struct(in)
	if err != nil {
		if errs, ok := err.(validator.ValidationErrors); ok {
			return NewApiError(errs)
		}
		return err
	}
	return nil
}
