import { useContext } from 'react';
import { ProductContext } from '../contexts/ProductContext';

export const useProducts = () => useContext(ProductContext);