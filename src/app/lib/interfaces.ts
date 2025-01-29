// ProductInterface - schema of a product
export interface ProductInterface {
  id: string;
  section: string;
  quantity: number;
  icon: string;
  image: string;
  created: string;
}

// SectionInterface - schema of a section
export interface SectionInterface {
  id: string;
  name: string;
  order: number;
  collapse: boolean;
}

// DBReseponseInterface - schema of a full db response
export interface DBReseponseInterface {
  sections: SectionInterface[];
  products: ProductInterface[];
}

// ApiResponseInterface - schema of a 
export interface ApiResponseInterface {
  items: ProductInterface[];
  sections: {[key: string]: SectionInterface};
}
