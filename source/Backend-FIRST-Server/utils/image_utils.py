import io
import base64

import numpy as np
from PIL import Image

def convert_RGBA_to_RGB(img):
    img = np.asarray(img)
    img = img[:, :, 3]
    return Image.fromarray(img)

def crop_image(img, crop):
    width, height = img.size
    print(crop)
    box = (
        int(crop["left"] * width),
        int(crop["upper"] * height),
        int(crop["right"] * width),
        int(crop["lower"] * height) 
    )
    return img.crop(box)

def decode_b64_image(image_encoded):
    if image_encoded.find(",") != -1:
        image_encoded = image_encoded.split(',')[1]
    return Image.open(io.BytesIO(base64.b64decode(image_encoded)))