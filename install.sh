#!/usr/bin/env bash

install() {
  dir=$1
  pushd ${dir}
  npm i
  popd
}

for dir in {'common','core','core-node','core-testing','model','model-builder','config','data','cache','mvc','hal','mvc-hal','mvc-view'}
do
  install ${dir%*/}
done

for dir in {'config-aws-ssm','data-pg','mvc-express','mvc-auth-firebase','aws-lambda','mvc-view-ejs','mvc-view-pug'}
do
  install _contrib/${dir%*/}
done
