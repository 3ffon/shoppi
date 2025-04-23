/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotification } from './NotificationProvider';
import { useDictionary } from './DictionaryProvider';
import { MainCartInterface, ProductInterface, SectionInterface, CartItemInterface } from '@/app/lib/interfaces';
import {
    fetchDb,
    createProduct,
    updateProduct,
    deleteProduct,
    createSection,
    updateSection,
    deleteSection,
    addItemToMainCart,
    updateMainCartItem,
    removeItemFromMainCart,
} from '@/app/lib/apiClient';

interface ProductsContextType {
    products: { [key: string]: ProductInterface };
    sections: { [key: string]: SectionInterface };
    mainCart: MainCartInterface;
    loadingState: boolean;

    loadDB: () => void;

    createProduct: (product: ProductInterface) => void;
    updateProduct: (product: ProductInterface) => void;
    deleteProduct: (product: ProductInterface) => void;

    createSection: (section: SectionInterface) => void;
    updateSection: (section: SectionInterface) => void;
    deleteSection: (section: SectionInterface) => void;
    
    addCartItem: (item: CartItemInterface) => void;
    updateCartItem: (item: CartItemInterface) => void;
    removeCartItem: (itemId: string) => void;
}

const DBContext = createContext<ProductsContextType | undefined>(undefined);

export function DBProvider({ children }: { children: React.ReactNode }) {
    const { showNotification } = useNotification();
    const { dictionary } = useDictionary();

    const [loading, setLoading] = useState<boolean>(false);
    const [products, setProducts] = useState<{ [key: string]: ProductInterface }>({});
    const [sections, setSections] = useState<{ [key: string]: SectionInterface }>({});
    const [mainCart, setMainCart] = useState<MainCartInterface>({ products: {} });

    /**
     * Managing Global State
     */
    const loadDB = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchDb();

            // Always update the state with fresh data
            setProducts(response.items.reduce((acc: { [key: string]: ProductInterface }, product: ProductInterface) => {
                acc[product.id] = product;
                return acc;
            }, {}));
            setSections(response.sections);
            setMainCart(response.mainCart);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []); // Remove products dependency as we always want fresh data

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let mounted = true;
        loadDB();
        const scheduleUpdateDB = async () => {
            if (mounted) {
                await loadDB();
                timer = setTimeout(scheduleUpdateDB, 2000);
            }
        };

        scheduleUpdateDB();

        return () => {
            mounted = false;
            clearTimeout(timer);
        }
    }, [loadDB]);

    /**
     * Managing Products
     */
    const createProductInternal = useCallback(async (product: ProductInterface) => {
        setLoading(true);
        setProducts(currentProducts => ({ ...currentProducts, [product.id]: product }));

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
        setProducts(currentProducts => ({ ...currentProducts, [product.id]: product }));

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
        setProducts(currentProducts => {
            const newProducts = { ...currentProducts };
            delete newProducts[product.id];
            return newProducts;
        });

        // Check if product exists in cart and remove it
        if (mainCart.products[product.id]) {
            setMainCart(currentCart => {
                const newProducts = { ...currentCart.products };
                delete newProducts[product.id];
                return {
                    products: newProducts
                };
            });
            try {
                await removeItemFromMainCart(product.id);
            } catch (err) {
                console.error("Failed to remove item from cart:", err);
            }
        }

        try {
            await deleteProduct(product);
            showNotification(dictionary.item_delete_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.item_delete_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, [mainCart.products]);

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

    /**
     * Managing Main Cart
     */
    const addOrUpdateCartItem = useCallback(async (cartItem: CartItemInterface) => {
        setLoading(true);
        setMainCart(currentCart => {
            return {
                products: {
                    ...currentCart.products,
                    [cartItem.id]: cartItem
                }
            }
        });
        
        try {
            await addItemToMainCart(cartItem);
            // showNotification(dictionary.item_add_to_cart_success || 'Item added to cart successfully', 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.item_add_to_cart_failed || 'Failed to add item to cart', 'error');
        } finally {
            setLoading(false);
        }
    }, [dictionary, showNotification]);
    
    const updateCartItemInternal = useCallback(async (cartItem: CartItemInterface) => {
        setLoading(true);
        setMainCart(currentCart => {
            return {
                products: {
                    ...currentCart.products,
                    [cartItem.id]: cartItem
                }
            }
        });
        
        try {
            await updateMainCartItem(cartItem);
            // showNotification(dictionary.item_update_in_cart_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.item_update_in_cart_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, [dictionary, showNotification]);
    
    const removeCartItemInternal = useCallback(async (itemId: string) => {
        setLoading(true);
        setMainCart(currentCart => {
            const newProducts = { ...currentCart.products };
            delete newProducts[itemId];
            return {
                products: newProducts
            };
        });
        
        try {
            await removeItemFromMainCart(itemId);
            // showNotification(dictionary.item_remove_from_cart_success, 'success');
        } catch (err) {
            console.error(err);
            showNotification(dictionary.item_remove_from_cart_failed, 'error');
        } finally {
            setLoading(false);
        }
    }, [dictionary, showNotification]);


    const value = {
        products,
        sections,
        mainCart,
        loadingState: loading,

        updateProduct: updateProductInternal,
        createProduct: createProductInternal,
        deleteProduct: deleteProductInternal,

        createSection: createSectionInternal,
        updateSection: updateSectionInternal,
        deleteSection: deleteSectionInternal,
        
        addCartItem: addOrUpdateCartItem,
        updateCartItem: updateCartItemInternal,
        removeCartItem: removeCartItemInternal,

        loadDB,
    };

    return (
        <DBContext.Provider value={value}>
            {children}
        </DBContext.Provider>
    );
}

export function useDB() {
    const context = useContext(DBContext);
    if (context === undefined) {
        throw new Error('useDB must be used within a DBProvider');
    }
    return context;
}