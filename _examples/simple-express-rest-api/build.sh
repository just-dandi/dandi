#!/usr/bin/env bash

rm -rf dist/*
tsc --outDir dist
pushd dist

mkdir -p .tmp
mv * .tmp

mv ./.tmp/_examples/simple-express-rest-api/* .
rm -rf ./.tmp/_examples

mkdir -p node_modules/@dandi
mkdir -p node_modules/@dandi-contrib

mv ./.tmp/_contrib/* node_modules/@dandi-contrib
rm -rf ./.tmp/_contrib

mv ./.tmp/* node_modules/@dandi
cp ../../../common/src/url.js node_modules/@dandi/common/src

cp ../src/view/*.pug ./src/view
cp ../src/view/*.ejs ./src/view

npm i express cors body-parser pug ejs
