# https://github.com/GoogleContainerTools/distroless
FROM gcr.io/distroless/static:nonroot

WORKDIR /

COPY ./main .
USER nonroot:nonroot

ENTRYPOINT ["./main"]
