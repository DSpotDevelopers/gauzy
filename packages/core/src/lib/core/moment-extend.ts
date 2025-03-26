import * as momentDefault from 'moment';
import { extendMoment } from 'moment-range';
import 'moment-timezone';

export const moment = extendMoment(momentDefault);
