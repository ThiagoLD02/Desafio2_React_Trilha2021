import React from "react";
import { Link } from "react-router-dom";
import { MdShoppingBasket } from "react-icons/md";

import logo from "../../assets/images/logo.svg";
import { Container, Cart } from "./styles";
import { useCart } from "../../hooks/useCart";
import { Product } from "../../types";

function countDistinctProducts(cart: Product[]) {
  let count = 0;
  let lastTitle = "";
  cart.forEach((product) => {
    if (product.title !== lastTitle) {
      count++;
      lastTitle = product.title;
    }
  });
  return count;
}

const Header = (): JSX.Element => {
  const { cart } = useCart();
  const cartSize = countDistinctProducts(cart);

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
