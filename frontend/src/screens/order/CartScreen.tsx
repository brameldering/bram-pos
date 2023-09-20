import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Form, Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { FaTrash } from 'react-icons/fa';
import Meta from '../../components/general/Meta';
import { Message } from '../../components/general/Messages';
import CheckoutSteps from '../../components/order/CheckoutSteps';
import { addToCart, removeFromCart } from '../../slices/cartSlice';
import { CURRENCY_SYMBOL } from '../../constantsFrontend';
import type { RootState } from '../../store';
import { CartItem } from '../../types/cartTypes';

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;

  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const addToCartHandler = (product: CartItem, qty: number) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    if (userInfo) {
      // user already logged in
      navigate('/shipping');
    } else {
      // user not yet logged in, log in first then redirect to shipping
      navigate('/login?redirect=/shipping');
    }
  };

  return (
    <>
      <Meta title='Shopping Cart' />
      <CheckoutSteps currentStep={0} />
      <Row>
        <Col md={8}>
          <h1 style={{ marginBottom: '20px' }}>Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <Message variant='info'>
              Your cart is empty <Link to='/'>Go to shop</Link>
            </Message>
          ) : (
            <ListGroup variant='flush'>
              {cartItems.map((item) => (
                <ListGroup.Item key={item.productId}>
                  <Row>
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid />
                    </Col>
                    <Col md={4}>
                      <Link
                        to={`/product/${item.productId}?goBackPath=${currentPath}`}>
                        {item.name}
                      </Link>
                    </Col>
                    <Col md={2}>
                      {CURRENCY_SYMBOL}
                      {Number(item.price).toFixed(2)}
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        as='select'
                        value={item.qty}
                        onChange={(e) =>
                          addToCartHandler(item, Number(e.target.value))
                        }>
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={2}>
                      <Button
                        type='button'
                        variant='light'
                        onClick={() => removeFromCartHandler(item.productId)}>
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>
                  Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  ) items
                </h2>
                {CURRENCY_SYMBOL}
                {cartItems
                  .reduce((acc, item) => acc + item.qty * item.price, 0)
                  .toFixed(2)}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='btn-block mt-2'
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}>
                  Proceed To Checkout
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CartScreen;