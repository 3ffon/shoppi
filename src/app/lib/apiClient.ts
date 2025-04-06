import axiosClient from "./axiosClient";
import { AxiosResponse } from "axios";
import { 
  ApiResponseInterface, 
  ProductInterface,
  SectionInterface, 
  CartInterface, 
  CartItemInterface 
} from "./interfaces";


// Fetch initial db
export const fetchDb = async (): Promise<ApiResponseInterface> => {
    const response: AxiosResponse<ApiResponseInterface> = await axiosClient.get('/api');
    return response.data;
};

export const fetchSections = async (): Promise<SectionInterface[]> => {
    const response: AxiosResponse<SectionInterface[]> = await axiosClient.get('/api/sections');
    return response.data;
};

// Update a product in db
export const updateProduct = async (product: ProductInterface): Promise<ProductInterface> => {
  // encode id
  const encodedId = encodeURIComponent(product.id);
  const response: AxiosResponse<ProductInterface> = await axiosClient.patch(`/api/products/${encodedId}`, product);
  return response.data;
};

// Create a product in db
export const createProduct = async (product: ProductInterface): Promise<ProductInterface> => {
  const response: AxiosResponse<ProductInterface> = await axiosClient.post('/api/products', product);
  return response.data;
};

// Delete a product in db
export const deleteProduct = async (product: ProductInterface): Promise<ProductInterface> => {
  const encodedId = encodeURIComponent(product.id);
  const response: AxiosResponse<ProductInterface> = await axiosClient.delete(`/api/products/${encodedId}`);
  return response.data;
};

// Update a section in db
export const updateSection = async (section: SectionInterface): Promise<SectionInterface> => {
  const encodedId = encodeURIComponent(section.id);
  const response: AxiosResponse<SectionInterface> = await axiosClient.patch(`/api/sections/${encodedId}`, section);
  return response.data;
};

// Create a section in db
export const createSection = async (section: SectionInterface): Promise<SectionInterface> => {
  const response: AxiosResponse<SectionInterface> = await axiosClient.post('/api/sections', section);
  return response.data;
};

// Delete a section in db
export const deleteSection = async (section: SectionInterface): Promise<SectionInterface> => {
  const encodedId = encodeURIComponent(section.id);
  const response: AxiosResponse<SectionInterface> = await axiosClient.delete(`/api/sections/${encodedId}`);
  return response.data;
};

// Cart API functions
export const updateCart = async (cart: CartInterface): Promise<CartInterface> => {
  const response = await axiosClient.put(`/api/carts/${cart.id}`, cart);
  return response.data;
};

export const updateCartItem = async (cartId: string, cartItem: CartItemInterface): Promise<CartItemInterface> => {
  const response = await axiosClient.put(`/api/carts/${cartId}/items/${cartItem.id}`, cartItem);
  return response.data;
};

export const addCartItem = async (cartId: string, cartItem: CartItemInterface): Promise<CartItemInterface> => {
  const response = await axiosClient.post(`/api/carts/${cartId}/items`, cartItem);
  return response.data;
};

export const removeCartItem = async (cartId: string, cartItemId: string): Promise<CartItemInterface> => {
  const response = await axiosClient.delete(`/api/carts/${cartId}/items/${cartItemId}`);
  return response.data;
};

export const clearCart = async (cartId: string): Promise<CartItemInterface[]> => {
  const response = await axiosClient.delete(`/api/carts/${cartId}/items`);
  return response.data;
};
