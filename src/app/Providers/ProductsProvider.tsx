/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotification } from './NotificationProvider';
import { useDictionary } from './DictionaryProvider';
import { ProductInterface, SectionInterface } from '@/app/lib/interfaces';
import {
    fetchDb,
    createProduct,
    updateProduct,
    deleteProduct,
    createSection,
    updateSection,
    deleteSection,
} from '@/app/lib/apiClient';

interface ProductsContextType {
    products: ProductInterface[];
    sections: { [key: string]: SectionInterface };
    loadingState: boolean;

    loadDB: () => void;

    createProduct: (product: ProductInterface) => void;
    updateProduct: (product: ProductInterface) => void;
    deleteProduct: (product: ProductInterface) => void;

    createSection: (section: SectionInterface) => void;
    updateSection: (section: SectionInterface) => void;
    deleteSection: (section: SectionInterface) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const { showNotification } = useNotification();
    const { dictionary } = useDictionary();

    const [products, setProducts] = useState<ProductInterface[]>([]);
    const [sections, setSections] = useState<{ [key: string]: SectionInterface }>({});
    const [loading, setLoading] = useState<boolean>(false);

    /**
     * Managing Global State
     */
    const loadDB = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchDb();
            
            // Always update the state with fresh data
            setProducts(response.items);
            setSections(response.sections);
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []); // Remove products dependency as we always want fresh data

    useEffect(() => {
        // let timer: NodeJS.Timeout;
        // let mounted = true;
        loadDB();
        // const scheduleUpdateDB = async () => {
        //     if (mounted) {
        //         await loadDB();
        //         timer = setTimeout(scheduleUpdateDB, 5000);
        //     }
        // };

        // scheduleUpdateDB();

        return () => {
            // mounted = false;
            // clearTimeout(timer);
        }
    }, [loadDB]);

    /**
     * Managing Products
     */
    const createProductInternal = useCallback(async (product: ProductInterface) => {
        setLoading(true);
        setProducts(currentProducts => [...currentProducts, product]);

        try {
            await createProduct(product);
            showNotification(dictionary.item_add_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.item_add_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProductInternal = useCallback(async (product: ProductInterface) => {
        setLoading(true);
        setProducts(currentProducts =>
            currentProducts.map(currentProduct =>
                currentProduct.id === product.id ? product : currentProduct
            )
        );

        try {
            await updateProduct(product);
            showNotification(dictionary.item_edit_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.item_edit_failed, 'error');

        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProductInternal = useCallback(async (product: ProductInterface) => {
        setLoading(true);
        setProducts(currentProducts => currentProducts.filter(currentProduct => currentProduct.id !== product.id));
        try {
            await deleteProduct(product);
            showNotification(dictionary.item_delete_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.item_delete_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, []);


    /**
     * Managing Sections
     */
    const createSectionInternal = useCallback(async (section: SectionInterface) => {
        setLoading(true);
        setSections(currentSections => ({ ...currentSections, [section.id]: section }));

        try {
            await createSection(section);
            showNotification(dictionary.section_add_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.section_add_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSectionInternal = useCallback(async (section: SectionInterface) => {
        setLoading(true);
        setSections(currentSections => ({ ...currentSections, [section.id]: section }));
        try {
            await updateSection(section);
            showNotification(dictionary.section_edit_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.section_edit_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteSectionInternal = useCallback(async (section: SectionInterface) => {
        setLoading(true);
        setSections(currentSections => {
            const newSections = { ...currentSections };
            delete newSections[section.id];
            return newSections;
        });
        try {
            await deleteSection(section);
            showNotification(dictionary.section_delete_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.section_delete_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        products,
        sections,
        loadingState: loading,
        updateProduct: updateProductInternal,
        createProduct: createProductInternal,
        deleteProduct: deleteProductInternal,
        createSection: createSectionInternal,
        updateSection: updateSectionInternal,
        deleteSection: deleteSectionInternal,
        loadDB,
    };

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductsContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
}