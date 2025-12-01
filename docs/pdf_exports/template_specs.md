# PDF Template Specifications & Assets

## 1. Template Meta Files

### Invoice (v2)
```json
{
  "name": "invoice_v2",
  "version": "1.0",
  "allowed_roles": ["SuperAdmin", "Finance", "OpsManager"],
  "sensitive_fields": ["buyer.pan", "seller.bank_account", "payment.txn_id"],
  "default_watermark": "draft",
  "page_size": "A4",
  "orientation": "portrait"
}
```

### Packing Slip
```json
{
  "name": "packing_slip_v1",
  "version": "1.0",
  "allowed_roles": ["SuperAdmin", "OpsManager", "WarehouseStaff"],
  "sensitive_fields": ["buyer.phone"],
  "default_watermark": "none",
  "page_size": "A4",
  "orientation": "portrait"
}
```

### Payslip
```json
{
  "name": "payslip_v1",
  "version": "1.0",
  "allowed_roles": ["SuperAdmin", "Finance", "HR"],
  "sensitive_fields": ["employee.bank_account", "employee.pan", "salary.components"],
  "default_watermark": "confidential",
  "page_size": "A4",
  "orientation": "portrait"
}
```

## 2. Masking Rules

| Field | Role Requirement | Masking Pattern | Example |
| :--- | :--- | :--- | :--- |
| `buyer.pan` | Finance / Admin | Show first 3 + last 2 | `ABCXXXXX12` |
| `seller.bank_account` | Finance / Admin | Show last 4 | `XXXXXX1234` |
| `payment.txn_id` | Finance / Admin | Show last 4 | `XXXXXXXX9876` |
| `buyer.phone` | Ops / Admin | Show last 3 | `XXXXXXX789` |
| `employee.salary` | Finance / HR | Hide completely | `********` |

**Watermark Logic:**
- If `include_signature` is FALSE -> Apply "DRAFT" watermark (opacity 0.15).
- If role lacks `signature_permission` -> Apply "DRAFT" watermark.
- If `options.watermark` == "final" -> No watermark.

## 3. Notification Email Copy

**Subject:** Your export {job_type} is ready — Job {job_id}

**Body:**
```text
Hello {user_name},

Your export request ({job_type}) started on {created_at} is complete.

You can download the file here (expires in {ttl_days} days):
{signed_url}

Summary:
- Job ID: {job_id}
- Items processed: {total_items}
- File size: {size_mb} MB
- Template: {template_name}

If you did not request this, contact support immediately.

Regards,
PulseKart Ops
```

## 4. QA Checklist

- [ ] **Data Integrity**: Fields match JSON input, numbers align right, totals are correct.
- [ ] **Masking**: Verify sensitive fields are masked for non-finance roles.
- [ ] **Layout**: Header/Footer repeats on multi-page docs. Page numbers are correct.
- [ ] **Watermark**: "DRAFT" appears when signature is missing or requested.
- [ ] **File Access**: Signed URL opens valid PDF (not 0 bytes).
- [ ] **Specifics**:
    - Packing Slip: Items sorted by pick location.
    - Payslip: Net pay matches gross - deductions.
    - Rx Order: Pharmacist verification block is visible.

## 5. Sample JSON Data (Invoice)

```json
{
  "invoice_number": "INV-2024-001",
  "invoice_date": "2024-11-30",
  "order_id": "ORD-9921",
  "seller": {
    "name": "PulseKart Health Pvt Ltd",
    "address": "123, Health Hub, Mumbai, MH 400001",
    "gstin": "27ABCDE1234F1Z5",
    "contact": "+91 98765 43210",
    "email": "support@pulsekart.com",
    "bank_account": "HDFC0001234"
  },
  "buyer": {
    "name": "Rahul Sharma",
    "address": "Flat 402, Sea View Apts, Bandra West, Mumbai 400050",
    "phone": "+91 99887 76655",
    "email": "rahul.s@example.com",
    "pan": "ABCDE1234F"
  },
  "items": [
    {
      "s_no": 1,
      "product": "Dolo 650mg",
      "hsn": "3004",
      "quantity": 2,
      "unit_price": 30.00,
      "taxable_value": 60.00,
      "tax_rate": 12,
      "tax_amount": 7.20,
      "total": 67.20
    },
    {
      "s_no": 2,
      "product": "N95 Mask",
      "hsn": "6307",
      "quantity": 5,
      "unit_price": 100.00,
      "taxable_value": 500.00,
      "tax_rate": 5,
      "tax_amount": 25.00,
      "total": 525.00
    }
  ],
  "subtotal": 560.00,
  "discounts": 0.00,
  "shipping": 40.00,
  "total_tax": 32.20,
  "round_off": 0.00,
  "grand_total": 632.20,
  "amount_in_words": "Six Hundred Thirty Two Rupees and Twenty Paise",
  "payment": {
    "method": "UPI",
    "status": "Paid",
    "txn_id": "UPI1234567890"
  },
  "pharmacist_verification_status": "Verified by John Doe",
  "signature_image_url": "https://example.com/sig.png"
}
```
