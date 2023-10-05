import pytest
import json
from main import app, db
from werkzeug.security import generate_password_hash
from werkzeug.datastructures import FileStorage

access_token = ""

# Setting up the Flask test client
@pytest.fixture
def client():
    app.config['TESTING'] = True
    print("client!!!")
    with app.test_client() as client:
        yield client

def test_signup_successful():
    # Create a test client
    app.config['TESTING'] = True
    client = app.test_client()

    # Test user registration with valid details
    response = client.post('/signup', json={
        "username": "newuser",
        "password": "newpassword"
    })
    print(response)
    data = json.loads(response.data)
    if response.status_code == 201:
        assert data["message"] == "User created successfully"
    elif response.status_code == 400:
        assert data["error"] == "Username already exists"

def test_login():
    # Create a test client
    app.config['TESTING'] = True
    client = app.test_client()

    # Test user login with credentials
    response = client.post('/login', json={
        "username": "newuser",
        "password": "newpassword"
    })
    print(response)
    data = json.loads(response.data)
    assert response.status_code == 200
    global access_token
    access_token= data["access_token"]
    assert "access_token" in data
    # elif response.status_code == 401:
    #     assert data["error"] == "Invalid credentials."

def test_send_bullet_comments():
    app.config['TESTING'] = True
    client = app.test_client()
    global access_token
    print("access_token", access_token)
    if len(access_token) == 0:
        # login to get the access token
        login_response = client.post('/login', json={
            "username": "newuser",
            "password": "newpassword"
        })
        login_data = json.loads(login_response.data)
        access_token = login_data["access_token"]

    # Test sending a bullet comments
    response = client.post('/send_bullet_comment', json={
        "text": "This is a test message",
        "video_time_stamp": 1.5,
        "video_id": "testid123"
    }, headers={"Authorization": f"Bearer {access_token}"})

    data = json.loads(response.data)
    assert response.status_code == 201
    assert data["message"] == "Bullet comment sent successfully"


def test_upload_video(client):
    global access_token

    f = open('meta_720p.mp4', 'rb')
    mock_video_file = FileStorage(
        stream=f,
        filename='meta_720p.mp4',
        content_type='video/mp4'
    )
    # Prepare the data
    data = {
        'file': (mock_video_file, 'test_video.mp4'),
        'title': 'Test Video',
        'username': 'test_user'
    }

    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    response = client.post('/upload_video', data=data, headers=headers)
    print(response.data)
    assert response.status_code == 201

    response_data = json.loads(response.data.decode('utf-8'))

    assert 'message' in response_data
    assert response_data['message'] == 'Video uploaded successfully!'

    assert 'url' in response_data
    assert response_data['url'].startswith(
        'https://videos-stacks-uscaliforniaus-west1.s3.amazonaws.com/')  # Replace with your actual bucket name


def test_signup_duplicate_username(client):
    # Test user registration with a username that already exists
    response = client.post('/signup', json={
        "username": "newuser",
        "password": "newpassword"
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["error"] == "Username already exists"