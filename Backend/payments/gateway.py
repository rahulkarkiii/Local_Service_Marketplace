import uuid


def initiate_gateway_payment(payment):
    transaction_id = f"MOCK-{uuid.uuid4().hex[:12].upper()}"

    payment_url = (
        f"https://mock-gateway.example.com/pay/{transaction_id}"
    )

    return {
        "transaction_id": transaction_id,
        "payment_url": payment_url,
    }


def verify_gateway_payment(transaction_id, simulate_success=True):
    return simulate_success