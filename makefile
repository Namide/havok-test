install:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm install

code:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-p 8080\:5173 \
		-u "node" \
		node:slim \
		bash

dev:
	(sleep 4 && python3 -m webbrowser http://localhost:8081) &
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-p 8081\:5173 \
		-u "node" \
		node:slim \
		npm run dev

preview:
	(sleep 4 && python3 -m webbrowser http://localhost:8082) &
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-p 8082\:5173 \
		-u "node" \
		node:slim \
		npm run preview

debug:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-p 8081\:5173 \
		-u "node" \
		node:slim \
		npm run dev

lint:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm run lint

type:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm run type

lint-fix:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm run lint:fix

build:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm run build

pages:
	docker run -ti --rm \
		-v $(shell pwd):/usr/src/app \
		-w /usr/src/app \
		-u "node" \
		node:slim \
		npm run pages
