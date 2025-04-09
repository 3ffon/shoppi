import fs from "fs";
import {
  DBReseponseInterface,
  ProductInterface,
  SectionInterface,
  CartItemInterface,
  MainCartInterface,
} from "../lib/interfaces";

class DBHandler {
  db!: DBReseponseInterface;
  dbPath: string;

  constructor(path: string) {
    this.dbPath = path;
    this._readDB();
  }

  _readDB() {
    const data = fs.readFileSync(this.dbPath);
    this.db = JSON.parse(data.toString());
  }

  updateDB() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2));
      this._readDB();
    } catch (err) {
      throw err;
    }
  }

  getDB() {
    return this.db;
  }

  // #region Manage Products

  createProduct(product: ProductInterface) {
    this.db?.products.push(product);
    this.updateDB();
  }

  updateProduct(product: ProductInterface) {
    const product_ref = this.db?.products.find((prod) => {
      return product.id == prod.id;
    });

    if (product_ref === undefined) return { status: "product not found" };

    Object.assign(product_ref, product);
    this.updateDB();
    return product_ref;
  }

  deleteProduct(productId: string) {
    if (this.db) {
      this.db.products = this.db.products.filter((prod) => {
        return prod.id !== productId;
      });
      this.updateDB();
    }
  }

  // #endregion Managing Products

  // #region Manage Sections

  getSections() {
    return this.db?.sections;
  }

  createSection(section: SectionInterface) {
    // if order is not set, set it to the highest order + 1
    if (section.order === undefined) {
      const max_order = this.db?.sections.reduce((max, sect) => {
        return Math.max(max, sect.order || 0);
      }, 0);
      section.order = (max_order ?? 0) + 1;
    }

    this.db?.sections.push(section);
    this.updateDB();
  }

  updateSection(section: SectionInterface) {
    const section_ref = this.db?.sections.find((sect) => {
      return section.id == sect.id;
    });

    if (section_ref === undefined) return { status: "section not found" };

    Object.assign(section_ref, section);
    this.updateDB();
    return section_ref;
  }

  deleteSection(sectionId: string) {
    if (this.db) {
      this.db.sections = this.db.sections.filter(
        (sect) => sect.id !== sectionId
      );
      this.updateDB();
    }
  }

  // #endregion

  // #region Manage Main Cart

  getMainCart(): MainCartInterface {
    this.updateDB();
    return this.db.mainCart;
  }

  addItemToCart(item: CartItemInterface) {
    this.db.mainCart.products[item.id] = item;
    this.updateDB();
    return this.db.mainCart.products[item.id];
  }

  removeItemFromCart(item: CartItemInterface) {
    delete this.db.mainCart.products[item.id];
    this.updateDB();
    return item;
  }

  // #endregion
}

const DBController = new DBHandler("./products.json");
export default DBController;
