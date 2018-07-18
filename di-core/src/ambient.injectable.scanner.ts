import { Injectable } from './injectable.decorator';
import { Repository } from './repository'
import { Scanner }    from './scanner';

@Injectable(Scanner)
export class AmbientInjectableScanner implements Scanner {

    public async scan(): Promise<Repository> {
        return Repository.global;
    }

}
