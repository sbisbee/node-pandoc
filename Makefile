NODE := `which node nodejs`

JSHINT_CHECK := ./build/jshint-check.js

all: hint

hint:
	@@for file in `find . -name "*.js" | grep -v '^\./build/'`; do \
		echo "Hinting: $$file"; \
		${NODE} ${JSHINT_CHECK} $$file; \
		echo "--------------------------"; \
	done
