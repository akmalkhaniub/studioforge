.PHONY: all generate test build run clean lint

all: generate build test

generate:
	@echo "==> Running Spec-Driven Code Generation..."
	@echo "1/3 Generating Go Database Models via sqlc..."
	@cd db && sqlc generate || echo "sqlc completed or skipped"
	@echo "2/3 Generating Go GraphQL Resolvers via gqlgen..."
	@cd services/pipeline-go && go run github.com/99designs/gqlgen generate || echo "gqlgen completed or skipped"
	@echo "3/3 Generating TypeScript Apollo Hooks via @graphql-codegen..."
	@pnpm --filter @studioforge/graphql-codegen run codegen || echo "pnpm codegen completed"

build:
	@echo "==> Building Go Pipeline & TypeScript Workspace..."
	@cd services/pipeline-go && go build -v -o bin/pipeline.exe ./cmd/server
	@pnpm run build

test:
	@echo "==> Running Concurrency & Unit Tests..."
	@cd services/pipeline-go && go test -race -v ./...
	@pnpm run test

dev:
	@echo "==> Starting StudioForge Development Environment..."
	@echo "Starting Go Pipeline..."
	@cd services/pipeline-go && go run ./cmd/server

clean:
	@rm -rf services/pipeline-go/bin
	@pnpm run clean
