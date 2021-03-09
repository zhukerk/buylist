import { IlistItem } from './utils';

export class List {
  items?: { toBuy?: IlistItem[]; purchased?: IlistItem[] };
  listName: string;

  constructor(listName: string, toBuy?: IlistItem[], purchased?: IlistItem[]) {
    this.listName = listName;
    this.items = {};

    if (toBuy) {
      this.items.toBuy = toBuy;
    }

    if (purchased) {
      this.items.purchased = purchased;
    }
  }
}

export class ListItem {
  itemName: string;
  quantity: number = 1;
  unit: string  = 'pcs';

  constructor(itemName: string) {
    this.itemName = itemName;
  }
}
