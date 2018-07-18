#!/usr/bin/env bash


for dir in {'core','di-core','model','model-validation','config','config-aws-ssm','data','data-pg','cache','mvc','mvc-express','mvc-auth-firebase'}
do
    npm unpublish "@dandi/${dir%*/}@1.0.0-alpha.8"
    npm unpublish "@dandi/${dir%*/}@1.0.0-alpha.9"

done
