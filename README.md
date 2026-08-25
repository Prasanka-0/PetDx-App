# 🐾 PetDx — AI-Powered Pet Disease & Breed Recognition

<p align="center">
  <img src="https://img.shields.io/badge/Project-MSc%20Computer%20Science-00D9FF?style=for-the-badge&logo=academia&logoColor=white" alt="MSc Project">
  <img src="https://img.shields.io/badge/Mobile-Expo%20%2F%20React%20Native-000000?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/AI-TensorFlow%20%2F%20TFLite-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow">
  <img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
</p>

<p align="center">
  <strong>PetDx</strong> is an AI-powered mobile application developed as an MSc Computer Science project to assist pet owners in identifying common pet diseases and breeds from images.
</p>

<p align="center">
  <i>Computer Vision • Deep Learning • Mobile AI • Pet Health Assistance</i>
</p>

---

## 📌 Overview

PetDx is a mobile application that combines **computer vision, deep learning, and mobile technology** to provide image-based pet disease and breed recognition.

The application is designed around a simple workflow:

**Capture / Select Image → AI Analysis → Prediction → Result & Information**

The goal of the project is to demonstrate how machine learning can be integrated into a mobile application to make pet-related image analysis more accessible and user-friendly.

> ⚠️ **Important:** PetDx is an academic/research project and should not be considered a replacement for professional veterinary diagnosis.

---

## ✨ Key Features

- 🐶 **Dog breed recognition**
- 🐱 **Cat breed recognition**
- 🩺 **Pet disease recognition from images**
- 📷 **Camera and gallery image selection**
- 🤖 **AI-based image classification**
- ⚡ **On-device inference with TensorFlow Lite**
- 🔐 **User authentication**
- ☁️ **Firebase / Firestore integration**
- 📚 **Pet disease and breed information**
- 👤 **User profile management**
- 📱 **Mobile-first and user-friendly interface**

---

## 🎯 Project Objectives

The main objectives of PetDx are to:

1. Develop a mobile application capable of classifying selected pet images.
2. Explore deep learning techniques for pet breed and disease recognition.
3. Integrate a trained machine learning model into a mobile application.
4. Evaluate the feasibility of on-device AI inference using TensorFlow Lite.
5. Provide useful supporting information alongside prediction results.
6. Demonstrate an end-to-end workflow from dataset preparation to mobile deployment.

---

## 🧠 Machine Learning Pipeline

The AI component follows a standard image-classification workflow:

```text
                ┌──────────────────┐
                │   Image Dataset  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Data Preparation │
                │ & Preprocessing  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Model Training   │
                │   CNN / DL Model │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Model Evaluation │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ TensorFlow Lite  │
                │     Export       │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   PetDx Mobile   │
                │       App        │
                └──────────────────┘
```

### Model workflow

- Dataset collection and organization
- Image preprocessing and normalization
- Training/validation/test split
- CNN-based image classification
- Performance evaluation
- Model conversion to `.tflite`
- Mobile integration
- Real-time or image-based inference

---

## 🗂️ Dataset Structure

The dataset is organized by classification categories. A simplified structure is:

```text
dataset/
├── cats/
│   ├── breed_01/
│   ├── breed_02/
│   ├── breed_03/
│   └── ...
│
├── dogs/
│   ├── breed_01/
│   ├── breed_02/
│   ├── breed_03/
│   └── ...
│
└── diseases/
    ├── disease_01/
    ├── disease_02/
    ├── disease_03/
    └── ...
```

The actual classes and dataset distribution may vary depending on the final trained model.

---

## 🏗️ Application Architecture

```text
┌─────────────────────────────────────────────┐
│                   PetDx App                 │
├─────────────────────────────────────────────┤
│                                             │
│  Authentication     Home / Categories      │
│        │                    │               │
│        └──────────┬─────────┘               │
│                   ▼                         │
│             Image Selection                │
│             Camera / Gallery               │
│                   │                         │
│                   ▼                         │
│          TensorFlow Lite Model             │
│                   │                         │
│                   ▼                         │
│          Prediction / Confidence           │
│                   │                         │
│                   ▼                         │
│        Disease / Breed Information         │
│                                             │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
              Firebase / Firestore
```

---

## 🛠️ Technology Stack

### Mobile Application

| Technology | Purpose |
|---|---|
| **React Native** | Cross-platform mobile development |
| **Expo** | Mobile development and project tooling |
| **Expo Router** | Navigation and route management |
| **JavaScript / TypeScript** | Application development |
| **Expo Image Picker** | Camera/gallery image selection |
| **Ionicons** | UI icons |

### Machine Learning

| Technology | Purpose |
|---|---|
| **Python** | Model development and experimentation |
| **TensorFlow** | Deep learning model training |
| **TensorFlow Lite** | Mobile model deployment |
| **Keras** | Neural network development |
| **OpenCV** | Image processing |
| **NumPy** | Numerical processing |
| **scikit-learn** | Evaluation and preprocessing |

### Backend & Cloud

| Technology | Purpose |
|---|---|
| **Firebase Authentication** | User authentication |
| **Cloud Firestore** | Application data storage |
| **Firebase Storage** | Image/file storage where required |

---

## 📱 Main Application Screens

The application is structured around several core screens:

```text
Login
  │
  ├── Signup
  │
  ▼
Home
  │
  ├── Breed Recognition
  │
  ├── Disease Recognition
  │
  ├── Categories
  │
  └── Profile
```

### Core screens

- **Login Screen** — user authentication
- **Signup Screen** — new account creation
- **Home Screen** — central application dashboard
- **Scan Screen** — image capture/upload and AI analysis
- **Categories** — access to breed and disease categories
- **Profile Screen** — user information and account settings

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/)
- npm or yarn
- Expo CLI / Expo tooling
- Android Studio and/or an Android device
- Git
- Firebase project
- Python environment for model development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/PetDx.git
cd PetDx
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project and configure the required authentication and Firestore services.

Add the required Firebase configuration according to the structure used by the project.

> Never commit private credentials, API secrets, service account keys, or production configuration files to GitHub.

### 4. Start the development server

```bash
npx expo start
```

Then open the application using:

- Android Emulator
- iOS Simulator
- Expo Go (where supported)
- A compatible physical device

---

## 🔬 Research Context

PetDx was developed as part of an **MSc Computer Science project**, exploring the application of artificial intelligence and computer vision to a practical real-world problem.

The project brings together:

**Machine Learning + Computer Vision + Mobile Development + Cloud Services**

The research focuses on the practical challenges of:

- Image classification
- Dataset quality and class balance
- Model generalization
- Mobile AI deployment
- Inference performance
- User-friendly presentation of AI predictions

---

## 🔮 Future Improvements

Potential improvements include:

- 🧠 Support for additional disease classes
- 🐕 Expanded breed recognition
- 🐈 More comprehensive cat and dog datasets
- 📈 Improved model accuracy and robustness
- ⚡ Faster on-device inference
- 🌐 Cloud-based model updates
- 📷 Better image quality validation
- 📊 Prediction history and analytics
- 🔔 Reminders and pet health tracking
- 👨‍⚕️ Veterinary consultation integration
- 🌍 Multi-language support

---

## ⚠️ Limitations

PetDx has several important limitations:

- Predictions depend heavily on image quality.
- Similar visual symptoms can belong to different conditions.
- The available dataset may not represent all breeds, diseases, ages, or environments.
- A machine learning prediction does not constitute a veterinary diagnosis.
- Model performance may differ between laboratory/test images and real-world images.

---

## 👨‍💻 Author

### Prasanka Madhushan

**MSc Computer Science — PetDx**

Software Engineer | Full-Stack Developer | AI & Mobile Application Enthusiast

<p align="center">
  <a href="https://github.com/Prasanka-0">
    <img src="https://img.shields.io/badge/GitHub-Prasanka--Madhushan-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

---

## 📜 Academic Project

This repository contains work related to an **MSc Computer Science academic project**.

The repository is intended for educational, research, and demonstration purposes.

---

## ⭐ Support

If you find PetDx interesting or useful for learning about **AI-powered mobile applications**, consider giving the repository a ⭐.

<p align="center">
  <strong>🐾 PetDx — Making AI-Powered Pet Health Assistance More Accessible</strong>
</p>
