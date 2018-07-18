import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const masterPkg = require('./package.json');
const pkgName = process.argv[2];

const pkg = require(`./${pkgName}/package.json`);

pkg.version = masterPkg.version;

type Dependencies = { [pkg: string]: string };

function sortDependencies(deps: Dependencies) {
    return Object.keys(deps)
        .sort()
        .reduce((result, depName) => {
            result[depName] = deps[depName];
            return result;
        }, {});
}

function getPeerDependencies(deps: Dependencies, result: Dependencies = {}): Dependencies {
    return Object.keys(deps)
        .reduce((result, dep) => {
            if (!dep.startsWith('@dandi/')) {
                return result;
            }
            const depPkg = require(`./${dep.substring('@dandi/'.length)}/package.json`);
            Object.assign(result, depPkg.peerDependencies);
            return result;
        }, result)
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
        pkg.devDependencies[linkedPkgName] = masterPkg.version;
    });
    const secondaryDeps = getPeerDependencies(pkg.peerDependencies);
    pkg.devDependencies = sortDependencies(Object.assign(secondaryDeps, pkg.devDependencies));
    pkg.peerDependencies = sortDependencies(pkg.peerDependencies);
}

writeFileSync(resolve(__dirname, pkgName, 'package.json'), JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
