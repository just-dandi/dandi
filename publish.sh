#!/usr/bin/env bash

bold=$(tput bold)
normal=$(tput sgr0)
first=0

# exit on any error
set -e

trap errorHandler ERR

errorHandler() {
    echo ${bold}Error publishing ${dir%*/} during ${BASH_COMMAND}${normal}
}

#install() {
#
#
#}

publish() {

  path=$1
  pkgName=$(node -p "require('${path}/${dir%*/}/package.json').name")
  root=$PWD

  echo
  echo ${bold}${pkgName}${normal}
  echo ${bold}  Updating package version...${normal}
  node_modules/.bin/ts-node ./update.package.ts ${path}/${dir%*/}

  pushd ${path}/${dir%*/} >/dev/null

  echo ${bold}  Installing dependencies...${normal}

  npm install

  echo ${bold}  Building...
  rm -rf dist
  ${root}/node_modules/.bin/tsc -p tsconfig.build.json --outDir dist
  cp package.json dist
  if [[ -e README.md ]]
  then
    cp README.md dist
  fi
  cp ${root}/LICENSE dist
  echo ${bold}  Built.

  # run any postbuild
  hasPostbuild="$(npm run | grep postbuild)" || true
  if [[ ${#hasPostbuild} -gt 0 ]]
  then
    npm run postbuild
  fi

  cd dist >/dev/null

  targetPkg=${pkgName}@${pkgVersion}

  infoResult=$(npm info ${targetPkg} --registry https://registry.npmjs.org/ || true)
  if [[ ${#infoResult} -eq 0 ]]
  then

    echo ${bold}  Publishing ${targetPkg} from ${PWD}...
    npm publish --access public --registry https://registry.npmjs.org/

    infoResult=$(npm info ${targetPkg} --registry https://registry.npmjs.org/)
    while [[ ${#infoResult} -eq 0 ]]
    do
        echo "    Waiting for package on npm..."
        sleep 1
        infoResult=$(npm info ${targetPkg} --registry https://registry.npmjs.org/)
    done

  else
    echo ${bold}  Skipping publish for ${targetPkg}, already exists
  fi

  popd >/dev/null
}


pkgVersion=$(node -p "require('./package.json').version")

echo ${bold} Publishing @dandi suite v${pkgVersion}...${normal}
for dir in {'common','core','core-node','core-testing','model','model-builder','config','data','cache','mvc','hal','mvc-hal','mvc-view'}
do
  publish '.'
done

for dir in {'config-aws-ssm','data-pg','mvc-express','mvc-auth-firebase','aws-lambda','mvc-view-pug'}
do
  publish './_contrib'
done
