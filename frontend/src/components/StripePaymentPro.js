// import React, { useState } from 'react';
// import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// const StripePaymentPro = ({ amount, onSuccess, onError, onClose }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [processing, setProcessing] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!stripe || !elements) {
//       onError('Payment system not initialized. Please refresh the page.');
//       return;
//     }

//     setProcessing(true);

//     try {
//       const { error, paymentMethod } = await stripe.createPaymentMethod({
//         type: "card",
//         card: elements.getElement(CardElement),
//         billing_details: {
//           address: {
//             country: "IN",
//           },
//         },
//       });

//       if (error) {
//         onError(error.message);
//       } else {
//         onSuccess({
//           id: 'pm_' + Math.random().toString(36).substr(2, 9),
//           status: 'succeeded',
//           amount: amount * 100,
//           currency: 'inr'
//         });
//       }
//     } catch (err) {
//       onError("Payment failed. Please try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)'}}>
//       <div className="modal-dialog modal-fullscreen-lg-down modal-xl">
//         <div className="modal-content border-0 shadow-lg" style={{borderRadius: '20px', overflow: 'hidden'}}>
//           {/* Header */}
//           <div className="modal-header text-white position-relative" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem'}}>
//             <div className="position-absolute top-0 start-0 w-100 h-100" style={{background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.3}}></div>
//             <div className="position-relative d-flex align-items-center">
//               <div className="bg-white bg-opacity-20 rounded-circle p-3 me-4">
//                 <i className="fas fa-credit-card fa-2x"></i>
//               </div>
//               <div>
//                 <h3 className="mb-1 fw-bold">Secure Payment</h3>
//                 <p className="mb-0 opacity-75">Powered by Stripe • Bank-level security</p>
//               </div>
//             </div>
//             <button className="btn-close btn-close-white position-absolute" style={{top: '1.5rem', right: '1.5rem'}} onClick={onClose}></button>
//           </div>

//           <div className="modal-body p-0">
//             <div className="row g-0 min-vh-50">
//               {/* Payment Form Section */}
//               <div className="col-lg-7">
//                 <div className="p-5" style={{background: 'linear-gradient(145deg, #ffffff, #f8f9fa)'}}>
//                   {/* Progress Steps */}
//                   <div className="d-flex align-items-center mb-5">
//                     <div className="d-flex align-items-center me-4">
//                       <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
//                         <i className="fas fa-check text-white small"></i>
//                       </div>
//                       <span className="ms-2 small text-muted">Shipping</span>
//                     </div>
//                     <div className="flex-grow-1 border-top border-2 border-primary mx-3"></div>
//                     <div className="d-flex align-items-center">
//                       <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
//                         <span className="text-white small fw-bold">2</span>
//                       </div>
//                       <span className="ms-2 small fw-semibold text-primary">Payment</span>
//                     </div>
//                   </div>

//                   <form onSubmit={handleSubmit}>
//                     {/* Card Information */}
//                     <div className="mb-5">
//                       <div className="d-flex align-items-center mb-4">
//                         <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
//                           <i className="fas fa-credit-card text-primary"></i>
//                         </div>
//                         <div>
//                           <h5 className="mb-0 text-dark">Card Information</h5>
//                           <small className="text-muted">Your payment details are encrypted and secure</small>
//                         </div>
//                       </div>

//                       <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
//                         <div className="card-body p-4" style={{background: 'linear-gradient(145deg, #ffffff, #f8f9fa)', borderRadius: '15px'}}>
//                           <div style={{minHeight: '50px'}}>
//                             <CardElement
//                               options={{
//                                 style: {
//                                   base: {
//                                     fontSize: '16px',
//                                     color: '#2c3e50',
//                                     fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
//                                     fontWeight: '500',
//                                     '::placeholder': {
//                                       color: '#95a5a6',
//                                     },
//                                     iconColor: '#667eea',
//                                   },
//                                   invalid: {
//                                     color: '#e74c3c',
//                                     iconColor: '#e74c3c',
//                                   },
//                                   complete: {
//                                     color: '#27ae60',
//                                     iconColor: '#27ae60',
//                                   },
//                                 },
//                               }}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Security Features */}
//                     <div className="row mb-5">
//                       <div className="col-md-4">
//                         <div className="d-flex align-items-center p-3 bg-success bg-opacity-10 rounded-3">
//                           <i className="fas fa-shield-alt text-success me-2"></i>
//                           <small className="fw-semibold text-success">SSL Secured</small>
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="d-flex align-items-center p-3 bg-info bg-opacity-10 rounded-3">
//                           <i className="fas fa-lock text-info me-2"></i>
//                           <small className="fw-semibold text-info">PCI Compliant</small>
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         <div className="d-flex align-items-center p-3 bg-warning bg-opacity-10 rounded-3">
//                           <i className="fas fa-user-shield text-warning me-2"></i>
//                           <small className="fw-semibold text-warning">Fraud Protected</small>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="d-grid gap-3">
//                       <button
//                         type="submit"
//                         className="btn btn-lg text-white fw-bold py-4 position-relative overflow-hidden"
//                         style={{
//                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                           border: 'none',
//                           borderRadius: '15px',
//                           boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
//                           transition: 'all 0.3s ease'
//                         }}
//                         disabled={processing}
//                       >
//                         {processing ? (
//                           <>
//                             <div className="spinner-border spinner-border-sm me-3" role="status"></div>
//                             Processing your payment...
//                           </>
//                         ) : (
//                           <>
//                             <i className="fas fa-lock me-3"></i>
//                             Complete Payment • ₹{amount}
//                           </>
//                         )}
//                       </button>

//                       <button
//                         type="button"
//                         className="btn btn-outline-secondary btn-lg py-3"
//                         style={{borderRadius: '15px'}}
//                         onClick={onClose}
//                       >
//                         <i className="fas fa-arrow-left me-2"></i>Back to Checkout
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>

//               {/* Summary Section */}
//               <div className="col-lg-5">
//                 <div className="h-100 p-5" style={{background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)'}}>
//                   <div className="sticky-top">
//                     {/* Order Summary Header */}
//                     <div className="mb-4">
//                       <div className="d-flex align-items-center mb-3">
//                         <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
//                           <i className="fas fa-receipt text-primary"></i>
//                         </div>
//                         <h5 className="mb-0 text-dark">Order Summary</h5>
//                       </div>
//                     </div>

//                     {/* Payment Breakdown */}
//                     <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
//                       <div className="card-body p-4">
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <span className="text-muted">Subtotal</span>
//                           <span className="fw-semibold fs-5">₹{amount}</span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <span className="text-muted">Processing Fee</span>
//                           <span className="text-success fw-semibold">FREE</span>
//                         </div>
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <span className="text-muted">Taxes</span>
//                           <span className="text-success fw-semibold">Included</span>
//                         </div>
//                         <hr className="my-3" />
//                         <div className="d-flex justify-content-between align-items-center">
//                           <span className="fw-bold fs-4 text-dark">Total</span>
//                           <span className="fw-bold fs-3 text-primary">₹{amount}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Security & Payment Methods */}
//                     <div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
//                       <div className="card-body p-4">
//                         <h6 className="text-dark mb-4 text-center">Accepted Payment Methods</h6>

//                         {/* Payment Method Icons */}
//                         <div className="row g-2 mb-4">
//                           <div className="col-3">
//                             <div className="p-3 bg-white rounded-3 shadow-sm text-center">
//                               <i className="fab fa-cc-visa fa-2x text-primary"></i>
//                             </div>
//                           </div>
//                           <div className="col-3">
//                             <div className="p-3 bg-white rounded-3 shadow-sm text-center">
//                               <i className="fab fa-cc-mastercard fa-2x text-warning"></i>
//                             </div>
//                           </div>
//                           <div className="col-3">
//                             <div className="p-3 bg-white rounded-3 shadow-sm text-center">
//                               <i className="fab fa-cc-amex fa-2x text-info"></i>
//                             </div>
//                           </div>
//                           <div className="col-3">
//                             <div className="p-3 bg-white rounded-3 shadow-sm text-center">
//                               <i className="fab fa-cc-discover fa-2x text-success"></i>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Security Badges */}
//                         <div className="text-center">
//                           <div className="d-flex align-items-center justify-content-center mb-2">
//                             <i className="fas fa-shield-alt text-success me-2"></i>
//                             <small className="text-muted">256-bit SSL Encryption</small>
//                           </div>
//                           <div className="d-flex align-items-center justify-content-center mb-2">
//                             <i className="fas fa-lock text-success me-2"></i>
//                             <small className="text-muted">PCI DSS Level 1 Compliant</small>
//                           </div>
//                           <div className="d-flex align-items-center justify-content-center">
//                             <i className="fas fa-check-circle text-success me-2"></i>
//                             <small className="text-muted">Advanced Fraud Protection</small>
//                           </div>
//                         </div>

//                         {/* Stripe Badge */}
//                         <div className="text-center mt-4 pt-3 border-top">
//                           <div className="d-flex align-items-center justify-content-center">
//                             <span className="text-muted small me-2">Powered by</span>
//                             <i className="fab fa-stripe fa-2x text-primary"></i>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StripePaymentPro;
