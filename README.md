# angelscripts-k8s-deployments

Angelscripts for k8s deployments of node-organic cells

[organic-angel](https://github.com/node-organic/organic-angel) scripts for generating [docker](https://docs.docker.com/docker/) compatible configuration **and**  commands aiding [kubernetes](https://kubernetes.io/) usage for node-organic / [stem-skeleton v2.1](https://github.com/node-organic/organic-stem-skeleton) based cells

Works with [angelscripts-dockerbuild](https://github.com/node-organic/angelscripts-dockerbuild).

## prerequirements

* `kubectl`
* `git`
* `node` / `npm` / `npx`


## setup

```
$ npm i angelscripts-k8s-deployments --save
$ edit dna/cells/my-cell/production.yaml
```

### custom kubeconfig

Create a `.kubeconfig` file within the repo root folder, it will be used for `kubectl`.

## commands

### `angel release`
Does `angel release patch production default`. ;)

### `angel release :versionChange :branchName :namespace`

Targets current working directory as a cell and does an release of the cell to the default configured cluster.

1. builds via `packagejson.scripts.build`, defaults to `angel build`
2. publishes via `packagejson.scripts.publish`, defaults to `angel publish` 
3. commits package.json.version changes
4. applies `:branchName` dna to kubernetes cluster at given `:namespace`
5. tags and pushes to upstream git repository

### `angel k8s apply :branchName :namespace`

Does `kubectl apply` and sources that with the dna contents as YAML at given `:branchName`

### `angel k8s fapply :branchName :namespace`

Does `kubectl -f apply` and sources that with the dna contents as YAML at given `:branchName`

### `angel changes`

Does a check of the current working repository, git tags and cell's dependencies for changes to be released. it returns non-zero status when there are changes.

Note that dynamically loaded modules won't be included for checks. An workaround is to provide `packagejson.sources` array of [fast-glob](https://github.com/mrmlnc/fast-glob) patterns to be manually appended to the dependencies list.

### `angel k8s delete :branchName :namespace`

Does `kubectrl -f delete` with the dna contents at `:branchName`

### `angel dna-to-yaml :branchName`

Prints a dna contents at `:branchName` as YAML.

### `angel k8s logs :namespace`

Connects to default cluster via `kubectl logs` and shows all logs from all containers/pods across the given namespace

## TODO

PRs :smile:

* `angel cp` uses git archive workaround (!)
* tests :)
* anything which you may find useful ;)
