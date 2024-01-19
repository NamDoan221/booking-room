export interface ITask {
  id: string;
  account: {
    email: string;
    fullname: string;
    id: string;
    phone: string;
  };
  product: {
    name: string;
  };
  account_id: string;
  product_id: string;
  describe: string;
  status: string;
}


export interface IBodyAddTask {
  account_id: string;
  product_id: string;
  describe: string;
}