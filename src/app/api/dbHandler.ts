import fs from "fs";
import {
  DBReseponseInterface,
  ProductInterface,
  SectionInterface,
  CartInterface,
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

  /**
   * managing products
   */
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

  /**
   * managing sections
   */
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

  /**
   * Managing Main Cart
   */
  getMainCart(): MainCartInterface {
    return this.db.mainCart;
  }

  addItemToCart(item: CartItemInterface) {
    this.db.mainCart.products[item.id] = item;
    return this.db.mainCart.products[item.id];
  }

  removeItemFromCart(item: CartItemInterface) {
    delete this.db.mainCart.products[item.id];
    return item;
  }

  /**
   * Managing carts
   */
  addNewCart(cart: CartInterface) {
    this.db?.carts.push(cart);
    this.updateDB();
  }

  getCart(cartId: string) {
    return this.db?.carts.find((cart) => cart.id === cartId);
  }

  updateCart(
    cartId: string,
    updates: Partial<CartInterface>
  ): CartInterface | { status: string } {
    const cart = this.getCart(cartId);
    if (!cart) return { status: "cart not found" };

    Object.assign(cart, updates);
    this.updateDB();
    return cart;
  }

  addCartItem(cartId: string, item: CartItemInterface) {
    const cart = this.getCart(cartId);
    if (!cart) return { status: "cart not found" };

    // Check if item already exists
    const existingItem = cart.products.find((p) => p.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.products.push(item);
    }

    this.updateDB();
    return cart;
  }

  updateCartItem(
    cartId: string,
    itemId: string,
    updates: Partial<CartItemInterface>
  ) {
    const cart = this.getCart(cartId);
    if (!cart) return { status: "cart not found" };

    const item = cart.products.find((p) => p.id === itemId);
    if (!item) return { status: "item not found" };

    Object.assign(item, updates);
    this.updateDB();
    return cart;
  }

  removeCartItem(cartId: string, itemId: string) {
    const cart = this.getCart(cartId);
    if (!cart) return { status: "cart not found" };

    cart.products = cart.products.filter((p) => p.id !== itemId);
    this.updateDB();
    return cart;
  }

  clearCart(cartId: string) {
    const cart = this.getCart(cartId);
    if (!cart) return { status: "cart not found" };

    cart.products = [];
    this.updateDB();
    return cart;
  }
}

const DBController = new DBHandler("./products.json");
export default DBController;
