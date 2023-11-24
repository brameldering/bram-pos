import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { NextPageContext } from 'next';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormContainer from 'form/FormContainer';
import { FormField, PasswordField, SelectField } from 'form/FormComponents';
import { textField, passwordField } from 'form/ValidationSpecs';
import Meta from 'components/Meta';
import Loader from 'components/Loader';
import ErrorBlock from 'components/ErrorBlock';
import { getUserRoles } from 'api/get-user-roles';
import type { RootState } from 'slices/store';
import { setUserState } from 'slices/authSlice';
import { useSignUpMutation } from 'slices/usersApiSlice';

interface IFormInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

const schema = yup.object().shape({
  name: textField().required('Name is required'),
  email: textField()
    .required('Email is required')
    .email('Invalid email address'),
  password: passwordField(),
  role: yup.string().required('Role is required'),
});

interface TPageProps {
  roles: Array<{ role: string; desc: string }>;
}

const SignUpScreen: React.FC<TPageProps> = ({ roles }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const {
    register,
    control,
    handleSubmit,
    // setValue,
    getValues,
    reset,
    setError,
    // watch,
    formState: { isDirty, errors },
  } = useForm<IFormInput>({
    defaultValues: { name: '', email: '', password: '', role: '' },
    mode: 'onBlur',
    reValidateMode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  // Extract the 'redirect' query parameter with a default value of '/'
  const router = useRouter();
  const { query } = router;
  const redirect = query.redirect || '/';
  const redirectString = Array.isArray(redirect) ? redirect[0] : redirect;

  useEffect(() => {
    if (userInfo) {
      router.push(redirect.toString());
    }
  }, [router, redirect, userInfo]);

  const [doSignUp, { isLoading: isProcessing, error: errorSigninUp }] =
    useSignUpMutation();
  const onSubmit = async () => {
    const name = getValues('name');
    const email = getValues('email');
    const password = getValues('password');
    const role = getValues('role');
    try {
      const createdUser = await doSignUp({
        name,
        email,
        password,
        role,
      }).unwrap();
      reset();
      dispatch(setUserState(createdUser));
      Router.push(redirectString);
    } catch (err: any) {
      // To avoid "Uncaught in promise" errors in console, errors are handled by RTK mutation
    }
  };

  const onError = (error: any) => {
    console.log('ERROR:::', error);
  };

  const selectRoles = [
    { label: 'Select role', value: '' },
    ...roles.map((role) => ({ label: role.desc, value: role.role })),
  ];

  return (
    <FormContainer>
      <Meta title='Sign Up' />
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <h1 className='mb-4'>Sign Up</h1>
        {isProcessing && <Loader />}
        <FormField
          controlId='name'
          label='Full Name'
          register={register}
          error={errors.name}
          setError={setError}
        />
        <FormField
          controlId='email'
          label='Email'
          register={register}
          error={errors.email}
          setError={setError}
        />
        <PasswordField
          controlId='password'
          label='Password'
          register={register}
          error={errors.password}
          setError={setError}
        />
        <SelectField
          controlId='role'
          options={selectRoles}
          control={control}
          error={errors.role}
          setError={setError}
        />
        {errorSigninUp && <ErrorBlock error={errorSigninUp} />}
        <br />
        <Button
          id='BUTTON_register'
          type='submit'
          variant='primary mt-0'
          disabled={isProcessing || !isDirty}>
          Sign Up
        </Button>
      </Form>
      <Row className='py-3'>
        <Col>
          Already have an account?{' '}
          <Link
            id='LINK_already_have_an_account'
            href={
              redirect ? `/auth/signin?redirect=${redirect}` : '/auth/signin'
            }>
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

// Fetch User Roles (to fill dropdown box)
export const getServerSideProps = async (context: NextPageContext) => {
  try {
    const roles = await getUserRoles(context);
    return {
      props: { roles },
    };
  } catch (error) {
    // Handle errors if any
    console.error('Error fetching data:', error);
    return {
      props: { roles: [] },
    };
  }
};

export default SignUpScreen;
