import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

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
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: selectedProduct } = await api.get<Product>(
        `http://localhost:3333/products/${productId}`
      );

      const { data: productStock } = await api.get<Stock>(
        `http://localhost:3333/stock/${productId}`
      );

      const indexOfSelectedProduct = cart.findIndex((product) => {
        return product.id === productId;
      });

      if (indexOfSelectedProduct === -1) {
        selectedProduct.amount = 1;
        const newCart = [...cart, selectedProduct];
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else if (productStock.amount > cart[indexOfSelectedProduct].amount) {
        const newCart = [...cart];

        newCart[indexOfSelectedProduct].amount += 1;
        setCart(newCart);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else toast.error("Quantidade solicitada fora de estoque");
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (
        cart.findIndex((product) => {
          return product.id === productId;
        }) === -1
      ) {
        toast.error("Erro na remoção do produto");
        return;
      }

      let newCart = [...cart];
      newCart = newCart.filter((product) => {
        if (product.id !== productId) return product;
      });

      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if (amount <= 0) return;

    try {
      const { data: productStock } = await api.get<Stock>(
        `http://localhost:3333/stock/${productId}`
      );

      if (productStock.amount >= amount) {
        const newCart = [...cart];

        newCart.forEach((product) => {
          if (product.id === productId) product.amount = amount;
        });

        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else toast.error("Quantidade solicitada fora de estoque");
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
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
