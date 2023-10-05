import os

import boto3
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

from BulletComments import BulletComments
from video import Video

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'secret-key'
jwt = JWTManager(app)

# Connect to local MongoDB instance
client = MongoClient('localhost', 27017)
db = client['stacked']
db.bullet_comments = db["bulletComments"]
db.bullet_comments.create_index("video_id")
db.videos = db["videos"]

s3 = boto3.client('s3', aws_access_key_id=os.getenv("aws_access_key_id"),
                  aws_secret_access_key=os.getenv("aws_secret_access_key"), region_name=os.getenv("region_name"))
bucket_name = 'videos-stacks-uscaliforniaus-west1'


@app.errorhandler(401)
def internal_error(error):
    return jsonify({"error": "Invalid or expired credentials"}), 401


@app.route('/signup', methods=['POST'])
def signup():
    """Register a new user.

    Expected JSON:
        {
            "username": <str>,
            "password": <str>
        }

    Returns:
        JSON: Confirmation message with 201 status if successful, error message otherwise.
    """

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username or Password missing"}), 400

    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = generate_password_hash(password, method='scrypt')
    db.users.insert_one({"username": username, "password": hashed_pw})

    return jsonify({"message": "User created successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    """Authenticate a user and provide an access token.

    Expected JSON:
        {
            "username": <str>,
            "password": <str>
        }

    Returns:
        JSON: JWT access token if authentication is successful, error message otherwise.
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.users.find_one({"username": username})

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200


@app.route('/send_bullet_comment', methods=['POST'])
@jwt_required()
def send_bullet_comment():
    """
    Store a bullet comment in MongoDB associated with a video.

    Expected JSON:
        {
            "text": <str>,            # The text content of the bullet comment
            "video_id": <str>,        # The ID of the video associated with this comment
            "video_time_stamp": <int> # The time stamp in the video where this comment should appear
        }

    Returns:
        JSON response with success message and 200 status code.
    """
    current_user_id = get_jwt_identity()

    data = request.json
    text = data.get('text')
    video_id = data.get('video_id')
    video_time_stamp = data.get('video_time_stamp')

    if not all([text, video_id, video_time_stamp]):
        return jsonify({"error": "Missing required fields"}), 400

    # create bullet-comment instance
    comment = BulletComments(user_id=current_user_id, text=text, video_id=video_id, video_time_stamp=video_time_stamp)

    # store bullet-comment to mongoDB
    db.bullet_comments.insert_one(comment.to_dict())

    return jsonify({"message": "Bullet comment sent successfully"}), 201


@app.route('/get_bullet_comments', methods=['GET'])
# @jwt_required()
def get_bullet_comments():
    """Retrieve all bullet_comments.

    Expected Query Parameter:
        "video_id": <str>  # The ID of the video for which to fetch bullet comments

    Returns:
        JSON: List of all bullet_comments.
    """
    video_id = request.args.get('video_id')

    if not video_id:
        return jsonify({"error": "Missing video_id parameter"}), 400

    # get bullet comments from DB
    video_comments = db.bullet_comments.find({"video_id": video_id})
    comments_list = list(video_comments)

    for comment in comments_list:
        comment['_id'] = str(comment['_id'])

    return jsonify({"bullet_comments": comments_list}), 200


@app.route('/upload_video', methods=['POST'])
@jwt_required()
def upload_video():
    """
    Upload a video to S3 and store its metadata in MongoDB.

    Expected Query Parameter:
        "video_id": <str>  # The ID of the video for which to fetch bullet comments

    Returns:
        JSON response with success message and uploaded video URL.
    """
    file = request.files['file']
    title = request.form.get('title')
    username = request.form.get('username')

    if not all([file, title, username]):
        return jsonify({"error": "Missing required fields"}), 400

    # Upload to S3
    s3.upload_fileobj(file, bucket_name, file.filename)
    video_url = f"https://{bucket_name}.s3.amazonaws.com/{file.filename}"

    # Store video metaData in MongoDB
    video = Video(video_url, username, title)
    db.videos.insert_one(video.to_dict())

    return jsonify({"message": "Video uploaded successfully!", "url": video_url}), 201


@app.route('/get_video_list', methods=['GET'])
def get_video_list():
    """
    Retrieve the list of all videos.

    Returns:
        JSON response containing a list of videos.
    """
    videos = list(db.videos.find({}))
    for v in videos:
        v['_id'] = str(v['_id'])
    return jsonify(videos), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5010)
    # app.run(app, debug=True, port=5010) # , host='0.0.0.0'
