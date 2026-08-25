import tensorflow as tf
import json
import numpy as np
from utils.preprocess import preprocess_image

# Load Breed Model
breed_interpreter = tf.lite.Interpreter(model_path="model/breed_model.tflite")
breed_interpreter.allocate_tensors()
breed_input_details = breed_interpreter.get_input_details()
breed_output_details = breed_interpreter.get_output_details()

# Load Breed Labels
with open("model/breed_labels.json") as f:
    breed_labels = json.load(f)

# Load Disease Model
disease_model = tf.keras.models.load_model(
    "model/petdx_mobilenetv2.h5",
    compile=False
)

# Load Disease Labels
with open("model/disease_labels.json") as f:
    disease_labels = json.load(f)

def predict_breed(image):
    """
    Predict breed from image
    """
    input_data = preprocess_image(image)
    
    breed_interpreter.set_tensor(breed_input_details[0]['index'], input_data)
    breed_interpreter.invoke()
    
    output = breed_interpreter.get_tensor(breed_output_details[0]['index'])[0]
    
    index = int(np.argmax(output))
    confidence = float(output[index])
    
    return {
        "breed": breed_labels[index],
        "confidence": confidence,
        "all_predictions": [
            {"breed": breed_labels[i], "confidence": float(output[i])}
            for i in range(len(breed_labels))
        ]
    }

def predict_disease(image):
    """
    Predict disease from image using Keras model
    """
    input_data = preprocess_image(image)
    
    # Make prediction using Keras model
    predictions = disease_model.predict(input_data, verbose=0)
    output = predictions[0]
    
    index = int(np.argmax(output))
    confidence = float(output[index])
    
    return {
        "disease": disease_labels[index],
        "confidence": confidence,
        "all_predictions": [
            {"disease": disease_labels[i], "confidence": float(output[i])}
            for i in range(len(disease_labels))
        ]
    }

def predict_both(image):
    """
    Predict both breed and disease from image
    """
    breed_result = predict_breed(image)
    disease_result = predict_disease(image)
    
    return {
        "breed": breed_result,
        "disease": disease_result
    }