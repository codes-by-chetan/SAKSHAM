# Financial Management System - API Documentation

## Overview

Complete financial management system for bachatgats and gramsanghs with savings deposits, loans with reducing interest, payment tracking, and installment calculation engine.

---

## 1. Savings Deposit Management

### 1.1 Set Monthly Savings Deposit for BachatGat

**Endpoint:** `POST /financial/savings-deposit/bachatgat/{bachatGatId}`

**Request Body:**

```json
{
    "monthlyAmount": 10000
}
```

**Response:**

```json
{
    "statusCode": 201,
    "data": {
        "_id": "...",
        "bachatGat": "...",
        "monthlyAmount": 10000,
        "status": "active",
        "createdBy": "..."
    },
    "message": "Savings deposit configuration set successfully"
}
```

### 1.2 Set Monthly Savings Deposit for Gramsangh

**Endpoint:** `POST /financial/savings-deposit/gramsangh/{gramsanghId}`

**Request Body:**

```json
{
    "monthlyAmount": 5000
}
```

---

## 2. Loan Management

### 2.1 Create a Loan

**Endpoint:** `POST /financial/loan/create`

**Description:** Creates a loan for a member. Loans use reducing rate of interest calculation.

**Request Body:**

```json
{
    "memberId": "userId",
    "principalAmount": 10000,
    "interestRate": 1,
    "bachatGatId": "bachatGatId"
}
```

**Example:** Loan of ₹1000 at 1% monthly interest

- Month 1: Interest on ₹1000 = ₹10
- If ₹100 paid, balance = ₹900
- Month 2: Interest on ₹900 = ₹9

**Response:**

```json
{
    "statusCode": 201,
    "data": {
        "_id": "loanId",
        "member": "userId",
        "bachatGat": "bachatGatId",
        "principalAmount": 10000,
        "interestRate": 1,
        "remainingBalance": 10000,
        "totalAmountPaid": 0,
        "status": "active"
    }
}
```

### 2.2 Make Loan Payment

**Endpoint:** `POST /financial/loan/{loanId}/payment`

**Request Body:**

```json
{
    "principalToPayAmount": 500,
    "paymentMethod": "cash"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "payment": {
      "_id": "paymentId",
      "loan": {...},
      "principalPaid": 500,
      "interestPaid": 10,
      "remainingBalanceAfterPayment": 9500,
      "paymentDate": "2026-07-14T..."
    },
    "remainingBalance": 9500,
    "interestCalculated": 10
  },
  "message": "Loan payment processed successfully"
}
```

---

## 3. Deposit Payment Management

### 3.1 Record Monthly Deposit Payment

**Endpoint:** `POST /financial/deposit/payment`

**Description:** Records monthly savings deposit payment for a member. Tracks unpaid dues from previous months and carries them forward.

**Request Body:**

```json
{
    "memberId": "userId",
    "bachatGatId": "bachatGatId",
    "amountPaid": 10000,
    "month": "2026-07",
    "paymentMethod": "cash"
}
```

**Response:**

```json
{
    "statusCode": 200,
    "data": {
        "depositPayment": {
            "month": "2026-07",
            "depositAmount": 10000,
            "previousDue": 0,
            "totalDue": 10000,
            "amountPaid": 10000,
            "outstandingBalance": 0,
            "paymentStatus": "full"
        },
        "totalDue": 10000,
        "amountPaid": 10000,
        "outstandingBalance": 0,
        "paymentStatus": "full"
    },
    "message": "Deposit payment recorded successfully"
}
```

**Scenario - Partial Payment:**

```json
{
    "memberId": "userId",
    "bachatGatId": "bachatGatId",
    "amountPaid": 5000,
    "month": "2026-07",
    "paymentMethod": "transfer"
}
```

**Response:** Outstanding balance of ₹5000 carries to next month

```json
{
    "depositPayment": {
        "month": "2026-07",
        "totalDue": 10000,
        "amountPaid": 5000,
        "outstandingBalance": 5000,
        "paymentStatus": "partial"
    }
}
```

Next month (August), the member will have to pay: ₹10000 (August deposit) + ₹5000 (July unpaid) = ₹15000

---

## 4. Financial Information & Calculation Engine

### 4.1 Get Next Installment Details

**Endpoint:** `POST /financial/member/next-installment`

**Description:** Shows what the member needs to pay in the next month including:

- Monthly deposit amount
- Previous unpaid dues
- Estimated interest on all active loans
- Total amount due

**Request Body:**

```json
{
    "memberId": "userId",
    "bachatGatId": "bachatGatId",
    "nextMonth": "2026-08"
}
```

**Response:**

```json
{
    "statusCode": 200,
    "data": {
        "month": "2026-08",
        "depositDue": 10000,
        "previousMonthDue": 5000,
        "totalLoanInterestDue": 95,
        "totalAmountDue": 15095,
        "breakdown": {
            "monthlyDeposit": 10000,
            "unpaidDues": 5000,
            "estimatedLoanInterest": 95
        },
        "activeLoans": [
            {
                "loanId": "...",
                "borrowed": 10000,
                "remainingBalance": 9500,
                "interestRate": 1
            }
        ]
    },
    "message": "Next installment details retrieved successfully"
}
```

### 4.2 Get Member Financial Statement

**Endpoint:** `POST /financial/member/financial-statement`

**Request Body:**

```json
{
    "memberId": "userId",
    "bachatGatId": "bachatGatId"
}
```

**Response:**

```json
{
    "statusCode": 200,
    "data": {
        "member": {
            "_id": "userId",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com"
        },
        "totalSavingsDeposited": 25000,
        "outstandingDepositDue": 5000,
        "totalBorrowed": 10000,
        "totalLoanRepaid": 1000,
        "totalInterestPaid": 50,
        "currentLoanBalance": 9000
    },
    "message": "Financial statement retrieved successfully"
}
```

### 4.3 Get Member Payment History

**Endpoint:** `POST /financial/member/payment-history`

**Request Body:**

```json
{
    "memberId": "userId",
    "bachatGatId": "bachatGatId",
    "limit": 10,
    "offset": 0
}
```

**Response:**

```json
{
    "statusCode": 200,
    "data": {
        "deposits": [
            {
                "month": "2026-07",
                "depositAmount": 10000,
                "amountPaid": 10000,
                "paymentStatus": "full",
                "paymentDate": "2026-07-14T..."
            }
        ],
        "loans": [
            {
                "principalPaid": 500,
                "interestPaid": 10,
                "remainingBalanceAfterPayment": 9500,
                "paymentDate": "2026-07-14T..."
            }
        ]
    },
    "message": "Payment history retrieved successfully"
}
```

---

## Key Features

### ✅ Reducing Interest Calculation

- Interest calculated on remaining balance only
- Example: 1000 rs loan at 1% monthly
    - 1st payment: Interest on 1000 = 10 rs
    - 2nd payment: Interest on (remaining balance) = less than 10 rs

### ✅ Automatic Dues Tracking

- Unpaid amounts automatically carry forward to next month
- Members see total due including previous unpaid amounts
- No manual tracking needed

### ✅ Flexible Payment Options

- Full payment or installments (member's choice)
- Multiple payment methods (cash, transfer, check, other)
- Partial payments recorded with outstanding balance

### ✅ Financial Transparency

- Complete payment history
- Current financial state (savings, loans, interest)
- Monthly installment breakdown
- Aggregated financial statement

### ✅ Member-Specific Tracking

- Separate records for each bachatgat/gramsangh membership
- Savings and loan tracking per organization
- Complete audit trail

---

## Database Schema

### Models Created:

1. **SavingsDeposit** - Monthly savings configuration per group
2. **Loan** - Loan records with principal, interest, and balance
3. **LoanPayment** - Individual loan installment records
4. **DepositPayment** - Monthly deposit payment tracking
5. **MemberFinancial** - Aggregated financial state per member per group

---

## Error Codes

- `400` - Bad request (invalid amount, missing bachatGat/gramsangh, etc.)
- `404` - Not found (member, group, loan, configuration not found)
- `500` - Server error
