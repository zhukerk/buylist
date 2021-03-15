export interface Ilist {
  listName: string;
  items?: { toBuy?: IlistItem[]; purchased?: IlistItem[] };
}

export interface IlistItems {
  toBuy?: IlistItem[];
  purchased?: IlistItem[];
}

export interface IlistItem {
  itemName: string;
  quantity: number;
  unit: string;
}

export interface Irender {
  lists(listsArr: Ilist[]): void;
  list(listNumber: number): void;
  trash(trashArr: Ilist[]): void;
  settings(): void;
  helloScreen(): void;
}

export interface IsetUser {
  user: object | null;
  initUser(): void;
  signIn(email: string, password: string): void;
  signUp(email: string, password: string): void;
  logOut(): void;
  updateUserInfo(): void;
  sendForget(email: string): void;
}

export interface Iuser {
  uid: string;
  email: string;
  displayName: string;
  updateProfile(profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
}
