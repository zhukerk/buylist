import { setUser } from './setUser';
import { addEvents } from './utils';

export const init = () => {
  setUser.initUser();
  addEvents();
};
