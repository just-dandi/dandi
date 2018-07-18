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


pkgVersion=$(node -p "require('./package.json').version")

echo ${bold} Publishing @dandi suite v${pkgVersion}...${normal}
for dir in {'core','di-core','model','model-validation','config','config-aws-ssm','data','data-pg','cache','mvc','mvc-express','mvc-auth-firebase'}
do

    echo
    echo ${bold}${dir%*/}${normal}
    echo ${bold}  Updating package version...${normal}
    ts-node ./update.package.ts ${dir%*/}

    pushd ${dir%*/} >/dev/null

    echo ${bold}  Installing dependencies...${normal}

    npm install

    echo ${bold}  Building...
    rm -rf dist
    tsc --outDir dist
    cp package.json dist
    if [ -e README.md ]
    then
        cp README.md dist
    fi
    echo ${bold}  Built.

    # run any postbuild
    hasPostbuild="$(npm run | grep postbuild)" || true
    if [ ${#hasPostbuild} -gt 0 ]
    then
        npm run postbuild
    fi

    cd dist >/dev/null

    echo ${bold}  Publishing from ${PWD}...
#    npm publish --access public
#
#    result="$(npm info @dandi/${dir%*/}@${pkgVersion})"
#    while [ ${#result} -eq 0 ]
#    do
#        echo "    Waiting for package on npm..."
#        sleep 1
#        result="$(npm info @dandi/${dir%*/}@${pkgVersion})"
#    done

    popd >/dev/null


done
