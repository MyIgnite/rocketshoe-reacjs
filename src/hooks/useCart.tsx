import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    
    return [];
  });
    
  
  const addProduct = async (productId: number) => {
    const updatedCart = [...cart]
    const productExists = updatedCart.findIndex(product => product.id === productId)
    
    try {
      if(productExists !== -1) {
        const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

        if(updatedCart[productExists].amount >= stock.amount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }

        updatedCart[productExists].amount += 1
        setCart(updatedCart)
        
      } else {

        const { data: product } = await api.get(`/products/${productId}`)
        updatedCart.push({ ...product, amount: 1})
        setCart(updatedCart)
      }
    
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]
      const productExists = cart.findIndex(product => product.id === productId)
      
      if(productExists === -1) {
        toast.error('Erro na remoção do produto');
        return
      }

      updatedCart.splice(productExists, 1)
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount <= 0) {
        return
      }

      const updatedCart = [...cart]
      const productExists = updatedCart.findIndex(product => product.id === productId)

      if(productExists === -1) {
        toast.error('Erro na alteração de quantidade do produto');
        return
      }

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if(amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      updatedCart[productExists].amount = amount
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
