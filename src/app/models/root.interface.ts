import type { Current } from './current.interface';
import type { Location } from './location.interface';

export interface Root {
  location: Location;
  current: Current;
}
