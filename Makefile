act-build:
	act -j build -W .github/workflows/build.yml  -s GITHUB_TOKEN="$(shell gh auth token)" --artifact-server-path /tmp/artifacts

act-lint:
	act -j lint -W .github/workflows/lint.yml  -s GITHUB_TOKEN="$(shell gh auth token)" --artifact-server-path /tmp/artifacts