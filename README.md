# angelscripts-k8s-deployments

Angelscripts for k8s deployments of node-organic cells

[organic-angel](https://github.com/node-organic/organic-angel) scripts for generating [docker](https://docs.docker.com/docker/) compatible configuration **and**  commands aiding [kubernetes](https://kubernetes.io/) usage for node-organic / [stem-skeleton v2.1](https://github.com/node-organic/organic-stem-skeleton) based cells

## prerequirements

* `kubectl`
* `git`
* `node` / `npm` / `npx`

## commands

### `angel release`
Does `angel release patch`. ;)

### `angel release :versionChange`

Targets current working directory as a cell and does an release of the cell to the default configured cluster.

* builds, 
* publishes, 
* commits package.json.version changes, 
* applies deployment dna,
* tags and pushes to upstream git repository

### `angel apply :path`

Does `kubectl apply` and sources that with the dna contents as YAML at given `:path`

### `angel fapply :path`

Does `kubectl -f apply` and sources that with the dna contents as YAML at given `:path`

### `angel changes`

Does a check of the current working repository, git tags and cell's dependencies for changes to be released. it returns non-zero status when there are changes.

Note that dynamically loaded modules won't be included for checks. An workaround is to provide `packagejson.sources` array of [fast-glob](https://github.com/mrmlnc/fast-glob) patterns to be manually appended to the dependencies list.

### `angel delete :path`

Does `kubectrl -f delete` with the dna contents at `:path`

### `angel dna-to-yaml :path`

Prints a dna contents at `:path` as YAML.

### `angel logs`

Connects to default cluster via `kubectl logs` and shows all logs from all containers/pods across the cluster for the current cell

## TODO

PRs are welcome :smile:

* `angel cp` uses git archive workaround (!)
* tests :)
* anything which you may find useful ;)
