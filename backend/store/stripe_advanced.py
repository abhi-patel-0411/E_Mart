import stripe
import json
import logging
from decimal import Decimal
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem, Product

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripePaymentProcessor:
    """Advanced Stripe payment processing with comprehensive error handling"""
    
    @staticmethod
    def create_payment_intent(amount, currency='inr', customer_id=None, metadata=None):
        """Create a payment intent with advanced configuration"""
        try:
            intent_data = {
                'amount': int(amount * 100),  # Convert to smallest currency unit
                'currency': currency,
                'automatic_payment_methods': {'enabled': True},
                'metadata': metadata or {},
                'receipt_email': metadata.get('customer_email') if metadata else None,
                'description': f"Payment for order {metadata.get('order_id', 'N/A')}"
            }
            
            if customer_id:
                intent_data['customer'] = customer_id
            
            intent = stripe.PaymentIntent.create(**intent_data)
            
            logger.info(f"Payment intent created: {intent.id}")
            return intent
            
        except stripe.error.CardError as e:
            logger.error(f"Card error: {e.user_message}")
            raise Exception(f"Card error: {e.user_message}")
        except stripe.error.RateLimitError as e:
            logger.error("Rate limit error")
            raise Exception("Too many requests. Please try again later.")
        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid request: {e.user_message}")
            raise Exception("Invalid payment request")
        except stripe.error.AuthenticationError as e:
            logger.error("Authentication error")
            raise Exception("Payment service authentication failed")
        except stripe.error.APIConnectionError as e:
            logger.error("Network error")
            raise Exception("Network error. Please check your connection.")
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            raise Exception("Payment service error")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise Exception("An unexpected error occurred")
    
    @staticmethod
    def create_customer(email, name=None, phone=None):
        """Create a Stripe customer"""
        try:
            customer_data = {'email': email}
            if name:
                customer_data['name'] = name
            if phone:
                customer_data['phone'] = phone
                
            customer = stripe.Customer.create(**customer_data)
            logger.info(f"Customer created: {customer.id}")
            return customer
        except Exception as e:
            logger.error(f"Customer creation failed: {str(e)}")
            return None
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id):
        """Retrieve payment intent details"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent
        except Exception as e:
            logger.error(f"Failed to retrieve payment intent: {str(e)}")
            return None
    
    @staticmethod
    def create_refund(payment_intent_id, amount=None, reason=None):
        """Create a refund for a payment"""
        try:
            refund_data = {'payment_intent': payment_intent_id}
            if amount:
                refund_data['amount'] = int(amount * 100)
            if reason:
                refund_data['reason'] = reason
                
            refund = stripe.Refund.create(**refund_data)
            logger.info(f"Refund created: {refund.id}")
            return refund
        except Exception as e:
            logger.error(f"Refund failed: {str(e)}")
            return None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_advanced_payment_intent(request):
    """Create payment intent with advanced features"""
    try:
        # Extract request data
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'inr')
        save_payment_method = request.data.get('save_payment_method', False)
        order_items = request.data.get('order_items', [])
        
        # Validation
        if not amount or amount <= 0:
            return Response({
                'error': 'Valid amount is required',
                'code': 'INVALID_AMOUNT'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or get customer
        customer = None
        if save_payment_method:
            customer = StripePaymentProcessor.create_customer(
                email=request.user.email,
                name=f"{request.user.first_name} {request.user.last_name}".strip(),
                phone=getattr(request.user, 'phone', None)
            )
        
        # Prepare metadata
        metadata = {
            'user_id': str(request.user.id),
            'customer_email': request.user.email,
            'customer_name': f"{request.user.first_name} {request.user.last_name}".strip(),
            'order_items_count': str(len(order_items)),
            'save_payment_method': str(save_payment_method)
        }
        
        # Create payment intent
        intent = StripePaymentProcessor.create_payment_intent(
            amount=Decimal(str(amount)),
            currency=currency,
            customer_id=customer.id if customer else None,
            metadata=metadata
        )
        
        response_data = {
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
            'amount': intent.amount,
            'currency': intent.currency,
            'status': intent.status
        }
        
        if customer:
            response_data['customer_id'] = customer.id
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Payment intent creation failed: {str(e)}")
        return Response({
            'error': str(e),
            'code': 'PAYMENT_INTENT_FAILED'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_advanced_payment(request):
    """Confirm payment with comprehensive validation"""
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response({
                'error': 'Payment intent ID is required',
                'code': 'MISSING_PAYMENT_INTENT'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Retrieve payment intent
        intent = StripePaymentProcessor.retrieve_payment_intent(payment_intent_id)
        
        if not intent:
            return Response({
                'error': 'Payment intent not found',
                'code': 'PAYMENT_INTENT_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate payment status
        if intent.status not in ['succeeded', 'requires_capture']:
            return Response({
                'error': f'Payment not completed. Status: {intent.status}',
                'code': 'PAYMENT_NOT_COMPLETED',
                'status': intent.status
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract payment details
        payment_method = intent.payment_method
        if payment_method:
            payment_method_details = stripe.PaymentMethod.retrieve(payment_method)
        else:
            payment_method_details = None
        
        response_data = {
            'payment_intent_id': intent.id,
            'status': intent.status,
            'amount': intent.amount / 100,  # Convert back to main currency unit
            'currency': intent.currency,
            'created': intent.created,
            'payment_method': {
                'id': payment_method,
                'type': payment_method_details.type if payment_method_details else None,
                'card': payment_method_details.card if payment_method_details and payment_method_details.type == 'card' else None
            } if payment_method_details else None
        }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Payment confirmation failed: {str(e)}")
        return Response({
            'error': str(e),
            'code': 'PAYMENT_CONFIRMATION_FAILED'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_refund(request):
    """Create refund for a payment"""
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        amount = request.data.get('amount')  # Optional partial refund
        reason = request.data.get('reason', 'requested_by_customer')
        
        if not payment_intent_id:
            return Response({
                'error': 'Payment intent ID is required',
                'code': 'MISSING_PAYMENT_INTENT'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refund = StripePaymentProcessor.create_refund(
            payment_intent_id=payment_intent_id,
            amount=Decimal(str(amount)) if amount else None,
            reason=reason
        )
        
        if not refund:
            return Response({
                'error': 'Refund creation failed',
                'code': 'REFUND_FAILED'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'refund_id': refund.id,
            'amount': refund.amount / 100,
            'currency': refund.currency,
            'status': refund.status,
            'reason': refund.reason
        })
        
    except Exception as e:
        logger.error(f"Refund creation failed: {str(e)}")
        return Response({
            'error': str(e),
            'code': 'REFUND_CREATION_FAILED'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """Handle Stripe webhooks for real-time payment updates"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        return HttpResponse(status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        logger.info(f"Payment succeeded: {payment_intent['id']}")
        
        # Update order status in database
        try:
            # Find order by payment_intent_id and update status
            # This would be implemented based on your Order model
            pass
        except Exception as e:
            logger.error(f"Failed to update order status: {e}")
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        logger.warning(f"Payment failed: {payment_intent['id']}")
        
        # Handle failed payment
        try:
            # Update order status to failed
            pass
        except Exception as e:
            logger.error(f"Failed to handle payment failure: {e}")
    
    elif event['type'] == 'charge.dispute.created':
        dispute = event['data']['object']
        logger.warning(f"Dispute created: {dispute['id']}")
        
        # Handle dispute
        try:
            # Notify admin, update order status
            pass
        except Exception as e:
            logger.error(f"Failed to handle dispute: {e}")
    
    else:
        logger.info(f"Unhandled event type: {event['type']}")
    
    return HttpResponse(status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_methods(request):
    """Get saved payment methods for user"""
    try:
        # This would require storing customer_id in user profile
        customer_id = getattr(request.user, 'stripe_customer_id', None)
        
        if not customer_id:
            return Response({
                'payment_methods': []
            })
        
        payment_methods = stripe.PaymentMethod.list(
            customer=customer_id,
            type="card"
        )
        
        methods_data = []
        for pm in payment_methods.data:
            if pm.card:
                methods_data.append({
                    'id': pm.id,
                    'brand': pm.card.brand,
                    'last4': pm.card.last4,
                    'exp_month': pm.card.exp_month,
                    'exp_year': pm.card.exp_year,
                    'funding': pm.card.funding
                })
        
        return Response({
            'payment_methods': methods_data
        })
        
    except Exception as e:
        logger.error(f"Failed to retrieve payment methods: {str(e)}")
        return Response({
            'error': str(e),
            'code': 'PAYMENT_METHODS_FAILED'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)