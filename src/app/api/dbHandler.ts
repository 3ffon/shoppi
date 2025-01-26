import fs from 'fs';
import { DBReseponseInterface, ProductInterface, SectionInterface } from '../lib/interfaces'

class DBHandler {
    db : DBReseponseInterface | undefined;
    dbPath: string;

    constructor(path: string) {
        this.dbPath = path;
        const data = fs.readFileSync(this.dbPath);
        this.db = JSON.parse(data.toString());
    }

    updateDB() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2));
        } catch(err) {
            throw err;
        }
    }

    getDB() {
        return this.db;
    }

    createProduct(product: ProductInterface) {
        this.db?.products.push(product);
        this.updateDB();
    }

    updateProduct(product: ProductInterface) {
        const product_ref = this.db?.products.find(prod => {
            return product.id == prod.id
        });

        if (product_ref === undefined) return {status: 'product not found'};

        Object.assign(product_ref, product);
        this.updateDB();
        return product_ref;
    }

    createSection(section: SectionInterface) {
        this.db?.sections.push(section);
        this.updateDB();
    }

    updateSection(section: SectionInterface) {
        const section_ref = this.db?.sections.find(sect => {
            return section.id == sect.id
        });

        if (section_ref === undefined) return {status: 'section not found'};

        Object.assign(section_ref, section);
        this.updateDB();
        return section_ref;
    }
}

const DBController = new DBHandler('./products.json');
export default DBController;