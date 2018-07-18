#!/usr/bin/env bash

set -e

err() {
    echo oh no!
}
trap err ERR

#dir=core/
#pkgVersion=1.0.0-pubtest.25
#
#result="$(npm info @dandi/${dir%*/}@${pkgVersion})"
#while [ ${#result} -eq 0 ]
#do
#    echo "    Waiting for package on npm..."
#    sleep 1
#    result="$(npm info @dandi/${dir%*/}@${pkgVersion})"
#done

result="$(npm i || code=$? || true)"

echo result: ${result}
echo code: ${code}
