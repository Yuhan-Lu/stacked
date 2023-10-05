import uuid


class Video:
    """
    Represents a video object with a unique identifier, associated URL, uploader's username, and title.

    Attributes:
        _id (uuid.UUID): A unique identifier for each video instance.
        url (str): The URL where the video is hosted.
        user_name (str): The username of the user who uploaded the video.
        title (str): The title of the video.

    Methods:
        to_dict: Returns a dictionary representation of the Video instance.
    """
    def __init__(self, video_url, user_name, title):
        """
        Initializes a new Video instance with a unique identifier, URL, username, and title.

        Parameters:
            video_url (str): The URL where the video is hosted.
            user_name (str): The username of the user who uploaded the video.
            title (str): The title of the video.
        """
        self._id = uuid.uuid4()
        self.url = video_url
        self.user_name = user_name
        self.title = title

    def to_dict(self):
        """
        Converts the Video instance into a dictionary.

        Returns:
            dict: A dictionary containing the Video instance's attributes.
        """
        return {
            "_id": str(self._id),
            "url": self.url,
            "user_name": self.user_name,
            "title": self.title
        }
