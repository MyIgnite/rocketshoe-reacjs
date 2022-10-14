import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';

import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { ProductList } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  // const cartItemsAmount = cart.reduce((sumAmount, product) => {
  //   // TODO
  // }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const products = await api.get('/products ')
      setProducts(products.data)
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      { 
        products.map(({title, price, image, id}) => (
          <li key={id}>
            <img src={image} alt={title} />
            <strong>{title}</strong>
            <span>{formatPrice(price)}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(id)}
            >
            <div data-testid="cart-product-quantity">
              {/* <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[id] || 0} */}
            </div>
  
            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
        ))
      }
     
    </ProductList>
  );
};

export default Home;
