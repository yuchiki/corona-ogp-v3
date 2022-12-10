.PHONY: build

build:
	npm run tsc

run:
	NODE_ENV=develop node dist/index.js
