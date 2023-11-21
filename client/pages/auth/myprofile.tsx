import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
// import { toast } from 'react-toastify';
import { NextPageContext } from 'next';
// import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormContainer from '../../form/FormContainer';
import { FormField } from '../../form/FormComponents';
import { textField } from 'form/ValidationSpecs';
import Meta from 'components/Meta';
import Loader from 'components/Loader';
import ErrorBlock from 'components/ErrorBlock';
import { ICurrentUser } from 'types/user-types';
// import { useChangeUserProfileMutation } from 'slices/usersApiSlice';
import { getCurrentUser } from 'api/get-current-user';
import useRequest from 'hooks/use-request';
import { BASE_URL } from 'constants/constants-frontend';
import { UPDATE_PROFILE_URL } from '@orbitelco/common';

interface IFormInput {
  name: string;
  email: string;
}

const schema = yup.object().shape({
  name: textField().required('Name is required'),
  email: textField()
    .required('Email is required')
    .email('Invalid email address'),
});

interface TPageProps {
  currentUser?: ICurrentUser;
}

const ProfileScreen: React.FC<TPageProps> = ({ currentUser }) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { isDirty, errors },
  } = useForm<IFormInput>({
    defaultValues: { name: currentUser?.name, email: currentUser?.email },
    mode: 'onBlur',
    reValidateMode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  // const router = useRouter();

  const {
    doRequest,
    isProcessing,
    error: errorChanging,
  } = useRequest({
    url: BASE_URL + UPDATE_PROFILE_URL,
    method: 'put',
    onSuccess: () => {
      // toast.success('Profile updated');
      // router.reload();
      // Update cookie with new data
    },
  });

  const onSubmit = async () => {
    const name = getValues('name');
    const email = getValues('email');
    await doRequest({ body: { name, email } });
  };

  const onError = (error: any) => {
    console.log('ERROR:::', error);
  };

  return (
    <FormContainer>
      <Meta title='My Profile' />
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <h1>My Profile</h1>
        {isProcessing && <Loader />}
        <FormField
          controlId='name'
          label='Full name'
          register={register}
          error={errors.name}
        />
        <FormField
          controlId='email'
          label='Email'
          register={register}
          error={errors.email}
        />
        {errorChanging && <ErrorBlock error={errorChanging} />}
        <Row className='align-items-center'>
          <Col>
            <Button
              id='BUTTON_update'
              type='submit'
              variant='primary mt-2'
              disabled={isProcessing || !isDirty}>
              Update
            </Button>
          </Col>
          <Col className='text-end'>
            <Link id='LINK_change_password' href='/auth/changepassword'>
              Change Password
            </Link>
          </Col>
        </Row>
      </Form>
    </FormContainer>
  );
};

export const getServerSideProps = async (context: NextPageContext) => {
  const { data } = await getCurrentUser(context);
  return { props: data };
};

export default ProfileScreen;