// tslint:disable no-var-requires

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const masterPkg = require('./package.json');
const pkgName = process.argv[2];

const pkg = require(`./${pkgName}/package.json`);

pkg.version = masterPkg.version;

interface Dependencies { [pkg: string]: string; }

function sortDependencies(deps: Dependencies) {
    return Object.keys(deps)
        .sort()
        .reduce((result, depName) => {
            result[depName] = deps[depName];
            return result;
        }, {});
}

const links = readFileSync(resolve(__dirname, pkgName, 'npm.link'), 'utf-8')
    .split('\n')
    .filter(line => line.startsWith('npm link'));

if (links.length) {
    if (!pkg.peerDependencies) {
        pkg.peerDependencies = {};
    }

    if (!pkg.devDependencies) {
        pkg.devDependencies = {};
    }
    links.forEach(link => {
        const linkedPkgName = link.substr('npm link '.length);
        pkg.peerDependencies[linkedPkgName] = masterPkg.version;
    });
    pkg.peerDependencies = sortDependencies(pkg.peerDependencies);
}

writeFileSync(resolve(__dirname, pkgName, 'package.json'), JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
