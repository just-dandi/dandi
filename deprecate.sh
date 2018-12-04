#!/usr/bin/env bash

for dir in {'common','core','core-node','core-testing','model','model-builder','config','_contrib/config-aws-ssm','data','_contrib/data-pg','cache','mvc','_contrib/mvc-express','hal','mvc-hal','_contrib/mvc-auth-firebase','_contrib/aws-lambda'}
do
  pkgName=$(node -p "require('./${dir%*/}/package.json').name.replace('@dandi-contrib/', '@dandi/')")

  for pre in `seq 26 29`
  do
    echo "${pkgName}@1.0.0-alpha.${pre}"
    npm deprecate "${pkgName}@1.0.0-alpha.${pre}" "outdated prerelease" --registry https://registry.npmjs.org/
  done

done

# contrib
for dir in {'config-aws-ssm','data-pg','mvc-express','mvc-auth-firebase','aws-lambda'}
do
  pkgNewName=$(node -p "require('./_contrib/${dir%*/}/package.json').name")
  pkgName=$(node -p "require('./_contrib/${dir%*/}/package.json').name.replace('@dandi-contrib/', '@dandi/')")
  pre=29
  echo "${pkgName}@1.0.0-alpha.${pre}"
  npm deprecate "${pkgName}@1.0.0-alpha.${pre}" "this package has been moved to ${pkgNewName}" --registry https://registry.npmjs.org/

done
