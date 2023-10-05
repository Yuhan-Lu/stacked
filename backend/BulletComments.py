import uuid


class BulletComments:
    """
    Represents a BulletComments object that holds information about a single bullet comment.

    Attributes:
        _id (uuid.UUID): A unique identifier for each BulletComments instance.
        user_id (str): The user ID of the person who sent the bullet comment.
        text (str): The text content of the bullet comment.
        video_id (str): The ID of the video where the bullet comment appears.
        video_time_stamp (float): The time stamp in the video where the bullet comment will appear.

    Methods:
        to_dict(): Returns a dictionary representation of the BulletComments instance.
    """

    def __init__(self, user_id, text, video_id, video_time_stamp):
        """
        Initializes a new BulletComments instance.

        Parameters:
           user_id (str): The user ID of the person who sent the bullet comment.
           text (str): The text content of the bullet comment.
           video_id (str): The ID of the video where the bullet comment appears.
           video_time_stamp (float): The time stamp in the video where the bullet comment will appear.
        """
        self._id = uuid.uuid4()
        self.user_id = user_id
        self.text = text
        self.video_id = video_id
        self.video_time_stamp = video_time_stamp

    def to_dict(self):
        """
        Converts the BulletComments instance into a dictionary representation.

        Returns:
            dict: A dictionary that contains all attributes of the BulletComments instance.
        """
        return {
            "_id": str(self._id),
            "user_id": self.user_id,
            "text": self.text,
            "video_id": self.video_id,
            "video_time_stamp": self.video_time_stamp
        }
