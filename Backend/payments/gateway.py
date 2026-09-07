import requests
from django.conf import settings


class KhaltiError(Exception):
    pass


def initiate_gateway_payment(payment):
    url = f"{settings.KHALTI_BASE_URL}/epayment/initiate/"
    headers = {"Authorization": f"Key {settings.KHALTI_SECRET_KEY}"}

    customer = payment.customer
    customer_profile = getattr(customer, "customer_profile", None)
    customer_phone = getattr(customer_profile, "phone", None) or "9800000000"

    payload = {
        "return_url": settings.KHALTI_RETURN_URL,
        "website_url": settings.KHALTI_WEBSITE_URL,
        "amount": int(payment.amount * 100),
        "purchase_order_id": f"booking-{payment.booking_id}",
        "purchase_order_name": payment.booking.service.title,
        "customer_info": {
            "name": customer.get_full_name() or customer.username,
            "email": customer.email or "test@example.com",
            "phone": customer_phone,
        },
    }

    response = requests.post(url, json=payload, headers=headers, timeout=10)
    data = response.json()

    if response.status_code != 200:
        raise KhaltiError(data)

    return {
        "transaction_id": data["pidx"],
        "payment_url": data["payment_url"],
    }


def verify_gateway_payment(transaction_id):
    url = f"{settings.KHALTI_BASE_URL}/epayment/lookup/"
    headers = {"Authorization": f"Key {settings.KHALTI_SECRET_KEY}"}

    response = requests.post(
        url, json={"pidx": transaction_id}, headers=headers, timeout=10
    )
    data = response.json()

    if response.status_code != 200:
        raise KhaltiError(data)

    return data["status"]