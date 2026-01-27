# NexusBank API Testing Guide

## 🌐 Live URLs

### Frontend Dashboard (Test Your API)
**URL:** https://axilam.web.app/api-test.html

**Features:**
- 14 Quick Action buttons for common operations
- Custom Request builder (GET, POST, PUT, DELETE)
- Real-time response display
- Session management (Admin & User)
- Beautiful UI with responsive design

### Backend API (Cloud Function)
**Base URL:** https://bank-api-grsqjakhza-uc.a.run.app

---

## 🚀 Quick Start

### Step 1: Open the Dashboard
Navigate to: **https://axilam.web.app/api-test.html**

### Step 2: Test Operations (in order)
1. Click **"1. Health Check"** - Verify API is running
2. Click **"2. Init Admin"** - Initialize admin account
3. Click **"3. Admin Login"** - Login as admin
4. Click **"4. Create User 1"** - Create test user
5. Click **"6. User Login"** - Login as user
6. Click **"8. Check Balance"** - View user balance
7. Click **"9. Deposit Money"** - Add ₹1000
8. Click **"10. Withdraw Money"** - Withdraw ₹500

---

## 📚 API Endpoints Reference

### User Endpoints

#### Register User
```
POST /add
Body: {
  "name": "John Doe",
  "mobile": "9876543210",
  "password": "pass123",
  "email": "john@example.com",
  "city": "New York",
  "balance": 5000
}
```

#### Login User
```
POST /login
Body: {
  "mobile": "9876543210",
  "password": "pass123"
}
Response: { session_id: "XXXX", ... }
```

#### Check Balance
```
POST /balance/{mobile}
Body: { "session_id": "XXXX" }
Response: { "balance": 5000 }
```

#### Deposit Money
```
POST /deposit/{mobile}
Body: {
  "session_id": "XXXX",
  "amount": 1000
}
Note: 2% tax applied
```

#### Withdraw Money
```
POST /withdraw/{mobile}
Body: {
  "session_id": "XXXX",
  "amount": 500
}
Note: 2% tax applied
```

#### Transfer Money
```
POST /transfer/{mobile}
Body: {
  "session_id": "XXXX",
  "receiver": "9876543211",
  "amount": 200
}
Note: 2% tax applied
```

#### Get All Users
```
GET /read
Response: [{ user1 }, { user2 }, ...]
```

#### Get User Details
```
GET /user/{mobile}
Response: { user_details }
```

#### Update Profile
```
PUT /update/{mobile}
Body: {
  "session_id": "XXXX",
  "name": "New Name",
  "city": "Boston",
  "email": "new@example.com"
}
```

#### View Transactions
```
POST /transactions/{mobile}
Body: { "session_id": "XXXX" }
Response: [{ transaction1 }, { transaction2 }, ...]
```

---

### Admin Endpoints

#### Initialize Admin
```
GET /admin/init
Response: { "username": "admin", "password": "admin123" }
```

#### Admin Login
```
POST /admin/login
Body: {
  "username": "admin",
  "password": "admin123"
}
Response: { session_id: "XXXX" }
```

#### View All Users
```
GET /admin/users
Response: [{ all_users }]
```

#### View All Transactions
```
GET /admin/transactions
Response: [{ all_transactions }]
```

#### Get Total Balance
```
GET /admin/total_balance
Response: { "total_balance": 15048.0 }
```

#### Adjust User Balance
```
POST /admin/user/balance
Body: {
  "mobile": "9876543210",
  "amount": 500,
  "operation": "deposit" | "withdraw"
}
```

#### Update User (Admin)
```
PUT /admin/user/update/{mobile}
Body: {
  "name": "New Name",
  "city": "Boston"
}
```

#### Delete User (Admin)
```
DELETE /admin/user/delete/{mobile}
```

---

### Chat Endpoints

#### Send Message
```
POST /message
Body: {
  "To_": "9876543211",
  "From_": "9876543210",
  "Message": "Hello!"
}
```

#### Get All Messages
```
GET /all_messages
Response: [{ message1 }, { message2 }, ...]
```

---

## 🧪 Testing with Custom Requests

Use the **"Custom Request"** tab in the dashboard:

1. Select Method (GET, POST, PUT, DELETE)
2. Enter Endpoint (e.g., `/health`, `/read`, `/admin/users`)
3. Enter JSON Body (if needed)
4. Click "Send Request"

**Example:**
```
Method: POST
Endpoint: /deposit/9876543210
Body: {
  "session_id": "9841",
  "amount": 1000
}
```

---

## 🔐 Session Management

The dashboard automatically stores:
- **Admin Session ID** - After admin login
- **User Session ID** - After user login
- **User Mobile** - The logged-in user's phone
- **User Balance** - Current account balance

These values are displayed in the **"Session Storage"** section and used automatically in subsequent requests.

---

## ✅ Current Database State

- **Total Users:** 3
- **Total Balance:** ₹15,048.00
- **Admin Account:** admin/admin123
- **Test Users:** John Doe, Jane Smith

---

## 🐛 Troubleshooting

### Error: "Connection refused"
- Ensure the backend API is deployed
- Check URL: https://bank-api-grsqjakhza-uc.a.run.app

### Error: "Invalid session"
- Login first (steps 3 & 6)
- Session IDs are temporary and unique per login

### Error: "Insufficient balance"
- Deposit money first before withdrawing
- Transaction tax is 2%

### Missing data in response
- Check browser console for errors
- Verify JSON format in request body

---

## 📊 Key Features

✅ **User Management**
- Register, login, update profile
- View balance and transactions
- Deposit, withdraw, transfer money

✅ **Admin Dashboard**
- View all users and transactions
- Manage user accounts
- Monitor total balance

✅ **Chat System**
- Send messages between users
- View all messages

✅ **Security**
- Session-based authentication
- Password protection
- Tax deduction on transactions

✅ **Transaction Tracking**
- Automatic transaction history
- 2% tax on all transactions
- Timestamps for all operations

---

## 🎯 Next Steps

1. **Test all endpoints** using the dashboard
2. **Create more users** for testing
3. **Try transfers** between users
4. **Monitor balances** with admin tools
5. **Send messages** through chat

---

## 📞 Support

For issues or questions:
- Check the Help tab in the dashboard
- Review endpoint documentation above
- Check browser console for detailed errors

**Happy Banking! 🏦**
