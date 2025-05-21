from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Secret key for session management (must be set)
app.config['SECRET_KEY'] = 'your_secret_key_here'  # Replace with a secure random key

# CORS config - replace '*' with your frontend domain in production
CORS(app, resources={r"/*": {"origins": "*"}})

# PostgreSQL database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:yadI2127@localhost:5432/userdata'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# User model
class User(db.Model):
    __tablename__ = 'usuarisinfo'
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)  # Email should also be unique


# Register route
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        nom = data.get('nom', '').strip()
        password = data.get('password', '').strip()
        email = data.get('email', '').strip()

        if not nom or not password or not email:
            return jsonify({'error': 'Missing username, password, or email'}), 400

        if '@' not in email:
            return jsonify({'error': 'Invalid email format'}), 400

        if User.query.filter_by(nom=nom).first():
            return jsonify({'error': 'Username already exists'}), 409

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409

        hashed_password = generate_password_hash(password)
        new_user = User(nom=nom, password=hashed_password, email=email)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'User registered successfully',
            'user': {'id': new_user.id, 'nom': new_user.nom, 'email': new_user.email}
        }), 201

    except Exception as e:
        print(f"Error during registration: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    password = data.get('password', '').strip()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()

    if not password or (not username and not email):
        return jsonify({'error': 'Missing username/email or password'}), 400

    if username:
        user = User.query.filter_by(nom=username).first()
    else:
        user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 401

    if not check_password_hash(user.password, password):
        return jsonify({'error': 'Incorrect password'}), 401

    # Save user id to session for authentication
    session['user_id'] = user.id

    return jsonify({
        'message': 'Login successful',
        'user': {'id': user.id, 'nom': user.nom}
    })

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

# Update user route
@app.route('/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    session_user_id = session.get('user_id')
    if session_user_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    nom = data.get('nom', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if nom:
        if User.query.filter(User.nom == nom, User.id != user_id).first():
            return jsonify({'error': 'Username already exists'}), 409
        user.nom = nom

    if email:
        if '@' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        if User.query.filter(User.email == email, User.id != user_id).first():
            return jsonify({'error': 'Email already registered'}), 409
        user.email = email

    if password:
        user.password = generate_password_hash(password)

    db.session.commit()
    return jsonify({'message': 'User updated successfully'})


# Delete user route
@app.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    session_user_id = session.get('user_id')
    if session_user_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    session.pop('user_id', None)
    return jsonify({'message': 'User deleted successfully'})


# Get current logged-in user info
@app.route('/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'id': user.id, 'nom': user.nom, 'email': user.email})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="127.0.0.1", port=5000, debug=True)
