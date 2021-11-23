/* eslint-disable */
import axios from 'axios';
//import Stripe from 'stripe';
import { showAlert } from './alerts';
const stripe = window.Stripe('pk_test_51JuD8ISD7jwUDYxyxuI7AkthbfS0UMRFtqmWnW9pz4YNoMyA0UERgo40dU8TEhW4gtpz9lpcPtyagygFDTf4ZQ0C00yXVUuDZN');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkOut-Session/${tourId}`
    );
    //console.log(session);
    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } 
  catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
