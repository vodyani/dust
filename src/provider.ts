import { Injectable } from '@nestjs/common';

import { Dust, DustHybridContainer } from './common';

@Injectable()
export class DustProvider extends Dust {}

@Injectable()
export class DustHybridProvider extends DustHybridContainer {}
