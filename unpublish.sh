#!/usr/bin/env bash

# core modules
for dir in {'common','core','core-node','core-testing','model','model-builder','config','data','cache','mvc','hal','mvc-hal'}
do
    pkgName=$(node -p "require('./${dir%*/}/package.json').name")
    targetPkg="${pkgName}@1.0.0-alpha.27"
    echo ${targetPkg}
    npm unpublish ${targetPkg} --registry https://registry.npmjs.org/

done

# contrib
for dir in {'config-aws-ssm','data-pg','mvc-express','mvc-auth-firebase','aws-lambda'}
do
    pkgName=$(node -p "require('./_contrib/${dir%*/}/package.json').name")
    targetPkg="${pkgName}@1.0.0-alpha.27"
    echo ${targetPkg}
    npm unpublish ${targetPkg} --registry https://registry.npmjs.org/

done
