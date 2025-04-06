// ProductInterface - schema of a product
export interface ProductInterface {
  id: string;
  name: string;
  section: string;
  // quantity: number;
  icon: string;
  image: string;
  created: string;
}

// SectionInterface - schema of a section
export interface SectionInterface {
  id: string;
  name: string;
  order?: number;
  collapse?: boolean;
}

// CartItemInterface - schema of a cart item
export interface CartItemInterface {
  id: string;
  quantity: number;
  checked: boolean;
}

// CartInterface - schema of a cart
export interface CartInterface {
  id?: string;
  name?: string;
  products: CartItemInterface[];
}

// MainCartInterface
export interface MainCartInterface {
  products: { [id: string]: CartItemInterface };
}

// DBReseponseInterface - schema of a full db response
export interface DBReseponseInterface {
  sections: SectionInterface[];
  products: ProductInterface[];
  mainCart: MainCartInterface;
  carts: CartInterface[];
}

// ApiResponseInterface - schema of first api response
export interface ApiResponseInterface {
  items: ProductInterface[];
  sections: { [key: string]: SectionInterface };
  mainCart: MainCartInterface;
}
