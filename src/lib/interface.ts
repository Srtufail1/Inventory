export type InventoryProps = {
  title: string;
  description: string;
  action: any;
  btnTitle: string;
  data?: any;
  add?: string;
  selectedId?: any;
};

export type deleteBtnProps = {
  title: string;
  handleDelete: any;
};

export type InventoryDataProps = {
  id: string;
  name: string;
  description: string;
  cost: number;
  lifeSpan: number;
  createdAt: Date;
  updatedAt: Date | null;
}[];

export type InwardDataProps = {
  id: string;
  inumber: string;
  addDate: Date;
  customer: string;
  item: string;
  packing: string;
  weight: string;
  quantity: string;
  store_rate: string;
  labour_rate: string;
}[];

export type OutwardDataProps = {
  id: string;
  inumber: string;
  onumber: string;
  outDate: Date;
  customer: string;
  item: string;
  quantity: string;
}[];
