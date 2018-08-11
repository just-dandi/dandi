#!/usr/bin/env bash

for dir in {'common','core','core-testing','model','model-validation','config','config-aws-ssm','data','data-pg','cache','mvc','mvc-express','mvc-auth-firebase','aws-lambda-wrap'}
do
    pkgName=$(node -p "require('./${dir%*/}/package.json').name")

    echo "${pkgName}@1.0.0-alpha.16"
    npm unpublish "${pkgName}@1.0.0-alpha.16" --registry https://registry.npmjs.org/

done
