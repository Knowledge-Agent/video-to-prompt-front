import {
  PaymentEventType,
  SubscriptionCycleType,
} from '@/extensions/payment/types';
import { findOrderByOrderNo } from '@/shared/models/order';
import { findSubscriptionByProviderSubscriptionId } from '@/shared/models/subscription';
import {
  getPaymentService,
  handleCheckoutSuccess,
  handleSubscriptionCanceled,
  handleSubscriptionRenewal,
  handleSubscriptionUpdated,
} from '@/shared/services/payment';

export async function POST(req: Request) {
  try {
    const provider = 'stripe';

    const paymentService = await getPaymentService();
    const paymentProvider = paymentService.getProvider(provider);
    if (!paymentProvider) {
      throw new Error('payment provider not found');
    }

    const event = await paymentProvider.getPaymentEvent({ req });
    if (!event) {
      throw new Error('payment event not found');
    }

    const eventType = event.eventType;
    if (!eventType) {
      throw new Error('event type not found');
    }

    const session = event.paymentSession;
    if (!session) {
      throw new Error('payment session not found');
    }

    if (eventType === PaymentEventType.CHECKOUT_SUCCESS) {
      const orderNo = session.metadata.order_no;
      if (!orderNo) {
        throw new Error('order no not found');
      }

      const order = await findOrderByOrderNo(orderNo);
      if (!order) {
        throw new Error('order not found');
      }

      await handleCheckoutSuccess({
        order,
        session,
      });
    } else if (eventType === PaymentEventType.PAYMENT_SUCCESS) {
      if (session.subscriptionId && session.subscriptionInfo) {
        if (
          session.paymentInfo?.subscriptionCycleType ===
          SubscriptionCycleType.RENEWAL
        ) {
          const existingSubscription =
            await findSubscriptionByProviderSubscriptionId({
              provider,
              subscriptionId: session.subscriptionId,
            });
          if (!existingSubscription) {
            throw new Error('subscription not found');
          }

          await handleSubscriptionRenewal({
            subscription: existingSubscription,
            session,
          });
        }
      }
    } else if (eventType === PaymentEventType.SUBSCRIBE_UPDATED) {
      if (!session.subscriptionId || !session.subscriptionInfo) {
        throw new Error('subscription id or subscription info not found');
      }

      const existingSubscription =
        await findSubscriptionByProviderSubscriptionId({
          provider,
          subscriptionId: session.subscriptionId,
        });
      if (!existingSubscription) {
        throw new Error('subscription not found');
      }

      await handleSubscriptionUpdated({
        subscription: existingSubscription,
        session,
      });
    } else if (eventType === PaymentEventType.SUBSCRIBE_CANCELED) {
      if (!session.subscriptionId || !session.subscriptionInfo) {
        throw new Error('subscription id or subscription info not found');
      }

      const existingSubscription =
        await findSubscriptionByProviderSubscriptionId({
          provider,
          subscriptionId: session.subscriptionId,
        });
      if (!existingSubscription) {
        throw new Error('subscription not found');
      }

      await handleSubscriptionCanceled({
        subscription: existingSubscription,
        session,
      });
    }

    return Response.json({
      message: 'success',
    });
  } catch (err: any) {
    console.log('handle payment notify failed', err);
    return Response.json(
      {
        message: `handle payment notify failed: ${err.message}`,
      },
      {
        status: 500,
      }
    );
  }
}
