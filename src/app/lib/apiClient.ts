import axiosClient from "./axiosClient";
import { AxiosResponse } from "axios";
import { ApiResponseInterface, ProductInterface, SectionInterface } from "./interfaces";


// Fetch initial db
export const fetchDb = async (): Promise<ApiResponseInterface> => {
    const response: AxiosResponse<ApiResponseInterface> = await axiosClient.get('/api');
    return response.data;
};

// Update a product in db
export const updateProduct = async (id: string, product: ProductInterface): Promise<ProductInterface> => {
  const response: AxiosResponse<ProductInterface> = await axiosClient.patch(`/api/products/${id}`, product);
  return response.data;
};

// Update a section in db
export const updateSection = async (id: string, section: SectionInterface): Promise<SectionInterface> => {
    const response: AxiosResponse<SectionInterface> = await axiosClient.patch(`/api/sections/${id}`, section);
    return response.data;

};