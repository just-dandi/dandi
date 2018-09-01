#!/usr/bin/env bash

for dir in {'common','core','core-testing','model','model-validation','config','config-aws-ssm','data','data-pg','cache','mvc','mvc-express','mvc-hal','mvc-auth-firebase','aws-lambda-wrap'}
do
    pkgName=$(node -p "require('./${dir%*/}/package.json').name")
    targetPkg="${pkgName}@1.0.0-alpha.18"
    echo ${targetPkg}
    npm unpublish ${targetPkg} --registry https://registry.npmjs.org/

done
