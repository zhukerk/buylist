import { setUser } from './setUser';
import { addEvents, toggleAuthDom } from './utils'

export const init = () => {
  setUser.initUser();
  addEvents();
}
