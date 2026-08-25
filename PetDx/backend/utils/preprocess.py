import numpy as np
from PIL import Image

IMG_SIZE = 224 

def preprocess_image(image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    img = np.array(image)

    # Normalize
    img = img / 255.0

    # Batch dimension
    img = np.expand_dims(img.astype(np.float32), axis=0)

    return img