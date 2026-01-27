import random
import datetime
import json
from firebase_functions import https_fn, options
from firebase_admin import firestore, initialize_app, credentials

# Lazy initialization of Firebase
_initialized = False
_db = None

def get_db():
    global _initialized, _db
    if not _initialized:
        # Initialize Firebase (for local testing you might need credentials)
        # For Cloud Functions, it automatically detects credentials
        initialize_app()
        _db = firestore.client()
        _initialized = True
    return _db

def get_refs():
    db = get_db()
    return {
        'users': db.collection("nexus_users"),
        'transactions': db.collection("nexus_transactions"),
        'admin': db.collection("nexus_admin"),
        'discussion': db.collection("nexus_discussion")
    }

options.set_global_options(max_instances=10, region="us-central1")

# --- Helper: Custom JSON Serializer for Datetime ---
def json_response(data, status=200):
    def custom_serializer(obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, float):
            return round(obj, 2)
        return str(obj)
    
    body = json.dumps(data, default=custom_serializer, indent=2)
    # CORS headers are handled by the decorator, don't add them manually
    return https_fn.Response(body, status=status, headers={
        "Content-Type": "application/json"
    })

# --- Helper: Session Checkers ---
def is_user_session_valid(mobile, session_id):
    if not mobile or not session_id:
        return False
    refs = get_refs()
    doc = refs['users'].document(mobile).get()
    if not doc.exists:
        return False
    user_data = doc.to_dict()
    stored_session = user_data.get("session_id")
    return str(stored_session) == str(session_id)

def is_admin_session_valid(username, session_id):
    refs = get_refs()
    doc = refs['admin'].document(username).get()
    if not doc.exists:
        return False
    admin_data = doc.to_dict()
    stored_session = admin_data.get("session_id")
    return str(stored_session) == str(session_id)

# Removed add_cors_headers function - CORS is handled by the decorator

@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
)
def bank_api(req: https_fn.Request) -> https_fn.Response:
    # Get references
    refs = get_refs()
    users_ref = refs['users']
    transactions_ref = refs['transactions']
    admin_ref = refs['admin']
    discussion_ref = refs['discussion']
    db = get_db()
    
    # Handle CORS Preflight - decorator handles CORS headers automatically
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204, headers={
            "Content-Type": "application/json"
        })
    
    # Remove leading/trailing slashes from path
    path = req.path.strip("/")
    method = req.method
    data = req.get_json(silent=True) or {}

    try:
        # ------------------ USER REGISTRATION ------------------
        if path == "add" and method == "POST":
            required_fields = ['name', 'password', 'mobile', 'email', 'city', 'balance']
            for field in required_fields:
                if field not in data:
                    return json_response({"status": "fail", "message": f"Missing field: {field}"}, 400)
            
            mobile = data['mobile']
            
            # Check if user already exists
            if users_ref.document(mobile).get().exists:
                return json_response({"status": "error", "message": "Mobile already exists"}, 400)
            
            users_ref.document(mobile).set({
                "name": data['name'],
                "password": data['password'],
                "mobile": mobile,
                "email": data['email'],
                "city": data['city'],
                "balance": float(data['balance']),
                "session_id": None,
                "created_at": datetime.datetime.now()
            })
            
            return json_response({"status": "success", "message": "User added successfully!"})
        
        # ------------------ GET ALL USERS ------------------
        elif path == "read" and method == "GET":
            users = []
            for doc in users_ref.stream():
                user_data = doc.to_dict()
                # Remove sensitive data
                user_data.pop('password', None)
                user_data.pop('session_id', None)
                user_data['id'] = doc.id
                users.append(user_data)
            
            return json_response(users)
        
        # ------------------ LOGIN ------------------
        elif path == "login" and method == "POST":
            mobile = data.get('mobile')
            password = data.get('password')
            
            if not mobile or not password:
                return json_response({"status": "fail", "message": "Mobile and password are required"}, 400)
            
            user_doc = users_ref.document(mobile).get()
            
            if not user_doc.exists:
                return json_response({"status": "fail", "exists": False, "message": "User not found"}, 404)
            
            user_data = user_doc.to_dict()
            
            if user_data.get('password') == password:
                session_id = str(random.randint(1000, 9999))
                users_ref.document(mobile).update({"session_id": session_id})
                
                # Return user data without password
                user_response = user_data.copy()
                user_response.pop('password', None)
                user_response.pop('session_id', None)
                
                return json_response({
                    "status": "success",
                    "exists": True,
                    "session_id": session_id,
                    "mobile": mobile,
                    "user": user_response
                })
            
            return json_response({"status": "fail", "exists": False, "message": "Invalid credentials"}, 401)
        
        # ------------------ SESSION VERIFICATION ------------------
        elif path.startswith("check/session/") and method == "POST":
            mobile = path.split("/")[-1]
            session_id = data.get('session_id')
            
            if not session_id:
                return json_response({"status": "fail", "message": "Session ID is required"}, 400)
            
            is_valid = is_user_session_valid(mobile, session_id)
            return json_response({"status": "success", "session_valid": is_valid})
        
        # ------------------ TRANSFER MONEY ------------------
        elif path.startswith("transfer/") and method == "POST":
            mobile = path.split("/")[-1]
            
            # Check session
            session_id = data.get('session_id')
            if not is_user_session_valid(mobile, session_id):
                return json_response({"status": "fail", "message": "Invalid session"}, 403)
            
            receiver = data.get('receiver')
            amount = data.get('amount')
            
            if not receiver:
                return json_response({"status": "fail", "message": "Receiver mobile number is required"}, 400)
            
            try:
                amount = float(amount)
            except (ValueError, TypeError):
                return json_response({"status": "fail", "message": "Valid numeric amount is required"}, 400)
            
            if amount <= 0:
                return json_response({"status": "fail", "message": "Amount must be greater than zero"}, 400)
            
            # Check if receiver exists
            receiver_doc = users_ref.document(receiver).get()
            if not receiver_doc.exists:
                return json_response({"status": "fail", "message": "Receiver not found"}, 404)
            
            sender_doc = users_ref.document(mobile).get()
            sender_data = sender_doc.to_dict()
            
            # Calculate tax and total deduction
            tax = amount * 0.02
            total_deduction = amount
            net_amount = amount - tax
            
            if sender_data.get('balance', 0) < total_deduction:
                return json_response({"status": "fail", "message": "Insufficient balance"}, 400)
            
            # Use Firestore batch for atomic operation
            batch = db.batch()
            
            # Update sender balance
            batch.update(users_ref.document(mobile), {
                'balance': firestore.Increment(-total_deduction)
            })
            
            # Update receiver balance
            batch.update(users_ref.document(receiver), {
                'balance': firestore.Increment(net_amount)
            })
            
            # Commit batch
            batch.commit()
            
            # Record transactions
            now = datetime.datetime.now()
            
            transactions_ref.add({
                "mobile": mobile,
                "type": "send",
                "amount": amount,
                "Withdrawal": total_deduction,
                "Deposit": 0,
                "Send_to": receiver,
                "Receive_from": None,
                "Date": now
            })
            
            transactions_ref.add({
                "mobile": receiver,
                "type": "receive",
                "amount": net_amount,
                "Withdrawal": 0,
                "Deposit": net_amount,
                "Send_to": None,
                "Receive_from": mobile,
                "Date": now
            })
            
            return json_response({"status": "success", "message": "Amount transferred successfully!"})
        
        # ------------------ DEPOSIT ------------------
        elif path.startswith("deposit/") and method == "POST":
            mobile = path.split("/")[-1]
            
            # Check session
            session_id = data.get('session_id')
            if not is_user_session_valid(mobile, session_id):
                return json_response({"status": "fail", "message": "Invalid session"}, 403)
            
            try:
                amount = float(data.get('amount', 0))
            except (ValueError, TypeError):
                return json_response({"status": "fail", "message": "Valid numeric amount is required"}, 400)
            
            if amount <= 0:
                return json_response({"status": "fail", "message": "Amount must be greater than zero"}, 400)
            
            tax = amount * 0.02
            net_amount = amount - tax
            
            # Update balance
            user_doc = users_ref.document(mobile)
            user_doc.update({"balance": firestore.Increment(net_amount)})
            
            # Record transaction
            transactions_ref.add({
                "mobile": mobile,
                "type": "deposit",
                "amount": amount,
                "Withdrawal": 0,
                "Deposit": net_amount,
                "Send_to": "self",
                "Receive_from": "self",
                "Date": datetime.datetime.now()
            })
            
            return json_response({
                "status": "success", 
                "message": "Deposit successful!",
                "amount_deposited": net_amount
            })
        
        # ------------------ WITHDRAW ------------------
        elif path.startswith("withdraw/") and method == "POST":
            mobile = path.split("/")[-1]
            
            # Check session
            session_id = data.get('session_id')
            if not is_user_session_valid(mobile, session_id):
                return json_response({"status": "fail", "message": "Invalid session"}, 403)
            
            try:
                amount = float(data.get('amount', 0))
            except (ValueError, TypeError):
                return json_response({"status": "fail", "message": "Valid numeric amount is required"}, 400)
            
            if amount <= 0:
                return json_response({"status": "fail", "message": "Amount must be greater than zero"}, 400)
            
            # Calculate total deduction with tax
            tax = amount * 0.02
            total_deduction = amount + tax
            
            user_doc = users_ref.document(mobile)
            user_data = user_doc.get().to_dict()
            
            if user_data.get('balance', 0) < total_deduction:
                return json_response({"status": "fail", "message": "Insufficient balance"}, 400)
            
            # Update balance
            user_doc.update({"balance": firestore.Increment(-total_deduction)})
            
            # Record transaction
            transactions_ref.add({
                "mobile": mobile,
                "type": "withdraw",
                "amount": amount,
                "Withdrawal": total_deduction,
                "Deposit": 0,
                "Send_to": "self",
                "Receive_from": "self",
                "Date": datetime.datetime.now()
            })
            
            return json_response({
                "status": "success", 
                "message": "Withdrawal successful!", 
                "amount_withdrawn": amount - tax
            })
        
        # ------------------ TRANSACTION HISTORY ------------------
        elif path.startswith("transactions/") and method == "POST":
            mobile = path.split("/")[-1]
            
            # Check session
            session_id=data.get('session_id')
            if not is_user_session_valid(mobile, session_id):
                return json_response({"status": "fail", "message": "Invalid session"}, 403)
            
            # Get transactions for user
            txns = []
            query = transactions_ref.where("mobile", "==", mobile).order_by("Date", direction=firestore.Query.DESCENDING)
            
            for doc in query.stream():
                txn_data = doc.to_dict()
                txn_data['id'] = doc.id
                txns.append(txn_data)
            
            if not txns:
                return json_response({"status": "fail", "message": "No record found", "transactions": []})
            
            return json_response({"status": "success", "transactions": txns})
        
        # ------------------ UPDATE USER ------------------
        elif path.startswith("update/") and method == "PUT":
            mobile = path.split("/")[-1]
            
            # Check session
            session_id = data.get('session_id')
            if not is_user_session_valid(mobile, session_id):
                return json_response({"status": "fail", "message": "Invalid session"}, 403)
            
            update_data = {}
            
            if 'name' in data:
                update_data['name'] = data['name']
            if 'password' in data and data['password']:
                update_data['password'] = data['password']
            if 'email' in data:
                update_data['email'] = data['email']
            if 'city' in data:
                update_data['city'] = data['city']
            if 'balance' in data and data['balance'] is not None:
                update_data['balance'] = float(data['balance'])
            
            if not update_data:
                return json_response({"status": "fail", "message": "No data provided to update"}, 400)
            
            user_ref = users_ref.document(mobile)
            
            if not user_ref.get().exists:
                return json_response({"status": "fail", "message": "User not found"}, 404)
            
            user_ref.update(update_data)
            
            return json_response({"status": "success", "message": "User updated successfully"})
        
        # ------------------ DELETE USER ------------------
        elif path.startswith("delete/") and method == "DELETE":
            mobile = path.split("/")[-1]
            
            user_ref = users_ref.document(mobile)
            
            if not user_ref.get().exists:
                return json_response({"status": "fail", "message": "User not found"}, 404)
            
            user_ref.delete()
            
            # Delete user's transactions
            txns_query = transactions_ref.where("mobile", "==", mobile)
            for txn_doc in txns_query.stream():
                txn_doc.reference.delete()
            
            return json_response({"status": "success", "message": "User deleted successfully."})
        
        # ------------------ GET USER BY MOBILE ------------------
        elif path.startswith("user/") and method == "GET":
            mobile = path.split("/")[-1]
            
            user_doc = users_ref.document(mobile).get()
            
            if not user_doc.exists:
                return json_response({"status": "fail", "message": "User not found"}, 404)
            
            user_data = user_doc.to_dict()
            # Remove sensitive data
            user_data.pop('password', None)
            user_data.pop('session_id', None)
            user_data['id'] = user_doc.id
            
            return json_response({"status": "success", "user": user_data})
        
        # ------------------ GET USER BALANCE ------------------
        elif path.startswith("balance/") and method == "POST":
            mobile = path.split("/")[-1]
            
            # Check session
            session_id = data.get('session_id')
            if not is_user_session_valid(mobile, session_id):
                return json_response({"status": "fail", "message": "Invalid session"}, 403)
            
            user_doc = users_ref.document(mobile).get()
            
            if not user_doc.exists:
                return json_response({"status": "fail", "message": "User not found"}, 404)
            
            user_data = user_doc.to_dict()
            balance = user_data.get('balance', 0)
            
            return json_response({"status": "success", "balance": balance})
        
        # ------------------ ADMIN INIT ------------------
        elif path == "admin/init" and method == "GET":
            admin_ref.document("admin").set({
                "username": "admin",
                "password": "admin123",
                "session_id": None,
                "created_at": datetime.datetime.now()
            }, merge=True)
            
            return json_response({"status": "success", "message": "Default admin created: username='admin', password='admin123'"})
        
        # ------------------ ADMIN LOGIN ------------------
        elif path == "admin/login" and method == "POST":
            username = data.get("username")
            password = data.get("password")
            
            if not username or not password:
                return json_response({"status": "fail", "message": "Username and password are required"}, 400)
            
            admin_doc = admin_ref.document(username).get()
            
            if not admin_doc.exists:
                return json_response({"status": "fail", "message": "Admin not found"}, 404)
            
            admin_data = admin_doc.to_dict()
            
            if admin_data.get("password") == password:
                session_id = str(random.randint(1111, 9999))
                admin_ref.document(username).update({"session_id": session_id})
                
                return json_response({
                    "status": "success", 
                    "session_id": session_id, 
                    "message": "Admin login successful"
                })
            
            return json_response({"status": "fail", "message": "Invalid admin credentials"}, 401)
        
        # ------------------ ADMIN LOGOUT ------------------
        elif path == "admin/logout" and method == "POST":
            username = data.get("username")
            
            if not username:
                return json_response({"status": "fail", "message": "Username is required"}, 400)
            
            admin_ref.document(username).update({"session_id": None})
            
            return json_response({"status": "success", "message": f"Admin '{username}' logged out successfully"})
        
        # ------------------ ADMIN CHECK SESSION ------------------
        elif path == "admin/checksession" and method == "POST":
            username = data.get("username")
            session_id = data.get("session_id")
            
            if not username or not session_id:
                return json_response({"status": "fail", "message": "Username and session ID are required"}, 400)
            
            valid = is_admin_session_valid(username, session_id)
            return json_response({"status": "success", "session_valid": valid})
        
        # ------------------ ADMIN VIEW ALL USERS ------------------
        elif path == "admin/users" and method == "GET":
            users = []
            for doc in users_ref.stream():
                user_data = doc.to_dict()
                # Remove sensitive data
                user_data.pop('password', None)
                user_data.pop('session_id', None)
                user_data['id'] = doc.id
                users.append(user_data)
            
            return json_response({"status": "success", "users": users})
        
        # ------------------ ADMIN VIEW ALL TRANSACTIONS ------------------
        elif path == "admin/transactions" and method == "GET":
            transactions = []
            query = transactions_ref.order_by("Date", direction=firestore.Query.DESCENDING)
            
            for doc in query.stream():
                txn_data = doc.to_dict()
                txn_data['id'] = doc.id
                transactions.append(txn_data)
            
            return json_response({"status": "success", "transactions": transactions})
        
        # ------------------ ADMIN VIEW USER TRANSACTIONS ------------------
        elif path.startswith("admin/user/transactions/") and method == "GET":
            mobile = path.split("/")[-1]
            
            transactions = []
            query = transactions_ref.where("mobile", "==", mobile).order_by("Date", direction=firestore.Query.DESCENDING)
            
            for doc in query.stream():
                txn_data = doc.to_dict()
                txn_data['id'] = doc.id
                transactions.append(txn_data)
            
            if not transactions:
                return json_response({"status": "fail", "message": "No transactions found", "transactions": []})
            
            return json_response({"status": "success", "transactions": transactions})
        
        # ------------------ ADMIN UPDATE USER ------------------
        elif path.startswith("admin/user/update/") and method == "PUT":
            mobile = path.split("/")[-1]
            
            update_data = {}
            
            if 'name' in data:
                update_data['name'] = data['name']
            if 'password' in data and data['password']:
                update_data['password'] = data['password']
            if 'city' in data:
                update_data['city'] = data['city']
            if 'email' in data:
                update_data['email'] = data['email']
            if 'balance' in data and data['balance'] is not None:
                update_data['balance'] = float(data['balance'])
            
            if not update_data:
                return json_response({"status": "fail", "message": "No data provided"}, 400)
            
            user_ref = users_ref.document(mobile)
            
            if not user_ref.get().exists:
                return json_response({"status": "fail", "message": "User not found"})
            
            user_ref.update(update_data)
            
            return json_response({"status": "success", "message": "User updated successfully"})
        
        # ------------------ ADMIN DELETE USER ------------------
        elif path.startswith("admin/user/delete/") and method == "DELETE":
            mobile = path.split("/")[-1]
            
            user_ref = users_ref.document(mobile)
            
            if not user_ref.get().exists:
                return json_response({"status": "fail", "message": "User not found"})
            
            user_ref.delete()
            
            # Delete user's transactions
            txns_query = transactions_ref.where("mobile", "==", mobile)
            for txn_doc in txns_query.stream():
                txn_doc.reference.delete()
            
            return json_response({"status": "success", "message": "User deleted successfully"})
        
        # ------------------ ADMIN ADJUST BALANCE ------------------
        elif path == "admin/user/balance" and method == "POST":
            mobile = data.get("mobile")
            amount = data.get("amount")
            operation = data.get("operation")
            
            if not mobile or amount is None or not operation:
                return json_response({"status": "fail", "message": "Mobile, amount and operation are required"}, 400)
            
            try:
                amount = float(amount)
            except (ValueError, TypeError):
                return json_response({"status": "fail", "message": "Invalid amount"}, 400)
            
            user_ref = users_ref.document(mobile)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                return json_response({"status": "fail", "message": "User not found"}, 404)
            
            user_data = user_doc.to_dict()
            
            if operation == "deposit":
                user_ref.update({"balance": firestore.Increment(amount)})
                action = "Deposited"
            elif operation == "withdraw":
                if user_data.get('balance', 0) < amount:
                    return json_response({"status": "fail", "message": "Insufficient balance"}, 400)
                user_ref.update({"balance": firestore.Increment(-amount)})
                action = "Withdrawn"
            else:
                return json_response({"status": "fail", "message": "Invalid operation"}, 400)
            
            # Record transaction
            transactions_ref.add({
                "mobile": mobile,
                "type": f"admin_{operation}",
                "amount": amount,
                "Withdrawal": amount if operation == "withdraw" else 0,
                "Deposit": amount if operation == "deposit" else 0,
                "Send_to": "admin",
                "Receive_from": "admin",
                "Date": datetime.datetime.now()
            })
            
            return json_response({"status": "success", "message": f"{action} ₹{amount} successfully"})
        
        # ------------------ ADMIN TOTAL BALANCE ------------------
        elif path == "admin/total_balance" and method == "GET":
            total = 0
            for doc in users_ref.stream():
                user_data = doc.to_dict()
                total += user_data.get('balance', 0)
            
            return json_response({"status": "success", "total_balance": total})
        
        # ------------------ CHAT MESSAGES ------------------
        elif path == "message" and method == "POST":
            required_fields = ["To_", "From_", "Message"]
            for field in required_fields:
                if field not in data:
                    return json_response({"status": "fail", "message": f"Missing field: {field}"}, 400)
            
            discussion_ref.add({
                "To_": data["To_"],
                "From_": data["From_"],
                "Message": data["Message"],
                "DateTime": datetime.datetime.now()
            })
            
            return json_response({"status": "success", "message": "Message inserted successfully."})
        
        # ------------------ GET ALL MESSAGES ------------------
        elif path == "all_messages" and method == "GET":
            messages = []
            query = discussion_ref.order_by("DateTime")
            
            for doc in query.stream():
                msg_data = doc.to_dict()
                msg_data['id'] = doc.id
                messages.append(msg_data)
            
            return json_response(messages)
        
        # ------------------ HEALTH CHECK ------------------
        elif path == "health" and method == "GET":
            return json_response({"status": "success", "message": "Server is running"})
        
        # ------------------ 404 NOT FOUND ------------------
        else:
            return json_response({"status": "fail", "message": "Endpoint not found"}, 404)
    
    except Exception as e:
        print(f"Error in bank_api: {str(e)}")
        return json_response({"status": "error", "message": str(e)}, 500)

# Additional helper function for root path
@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
)
def root(req: https_fn.Request) -> https_fn.Response:
    if req.path == "/" or req.path == "":
        return json_response({
            "status": "success",
            "message": "NexusBank API",
            "version": "1.0.0",
            "endpoints": {
                "user": ["/login", "/add", "/read", "/transfer/{mobile}", "/deposit/{mobile}", "/withdraw/{mobile}", "/transactions/{mobile}"],
                "admin": ["/admin/login", "/admin/users", "/admin/transactions", "/admin/total_balance"],
                "chat": ["/message", "/all_messages"],
                "health": ["/health"]
            }
        })
    return json_response({"status": "fail", "message": "Not Found"}, 404)