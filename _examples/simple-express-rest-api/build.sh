#!/usr/bin/env bash

rm -rf dist
../../node_modules/.bin/tsc --outDir dist
pushd dist

mkdir -p .tmp
mv ./* .tmp

cp ../package.json .
yarn add express pug ejs

mv ./.tmp/_examples/simple-express-rest-api/* .
rm -rf ./.tmp/_examples

mkdir -p node_modules/@dandi
mkdir -p node_modules/@dandi-contrib

mv ./.tmp/packages/dandi-contrib/* node_modules/@dandi-contrib
rm -rf ./.tmp/packages/dandi-contrib

mv ./.tmp/packages/dandi/* node_modules/@dandi
cp ../../../packages/dandi/common/src/url.js node_modules/@dandi/common/src
cp ../../../packages/dandi/common/src/custom-inspector.js node_modules/@dandi/common/src

cp ../src/view/*.pug ./src/view
cp ../src/view/*.ejs ./src/view
