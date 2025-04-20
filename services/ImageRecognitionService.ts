"use server";

import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

interface PersonData {
  id: string;
  name: string;
  image: string;
  faceDescriptor?: Float32Array;
  features?: number[];
}

class ImageRecognitionService {
  private faceDetectionModel: any;
  private faceRecognitionModel: any;
  private mobilenetModel: any;
  private personDatabase: PersonData[] = [];

  constructor() {
    this.initModels();
  }

  private async initModels() {
    // Load face-api models
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

    // Load MobileNet for feature extraction
    this.mobilenetModel = await mobilenet.load();
  }

  // Add a person to the recognition database
  async addPerson(personData: PersonData) {
    // Extract face descriptor
    const img = await this.loadImage(personData.image);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      personData.faceDescriptor = detection.descriptor;

      // Extract image features using MobileNet
      const tensorImage = tf.browser.fromPixels(img);
      const features = await this.mobilenetModel.classify(tensorImage);
      personData.features = features.map((f) => f.probability);

      this.personDatabase.push(personData);
    }

    return detection !== undefined;
  }

  // Load image from base64 or URL
  private async loadImage(imageSrc: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageSrc;
    });
  }

  // Recognize person from an uploaded image
  async recognizePerson(uploadedImage: string): Promise<PersonData | null> {
    try {
      const img = await this.loadImage(uploadedImage);

      // Detect face in uploaded image
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return null;

      // Find best face match
      const matches = this.personDatabase
        .map((person) => {
          if (!person.faceDescriptor) return null;

          // Calculate face similarity
          const distance = faceapi.euclideanDistance(
            detection.descriptor,
            person.faceDescriptor
          );

          // Calculate feature similarity
          let featureSimilarity = 0;
          if (person.features) {
            const uploadedFeatures = await this.extractMobilenetFeatures(img);
            featureSimilarity = this.calculateFeatureSimilarity(
              uploadedFeatures,
              person.features
            );
          }

          return {
            person,
            faceDistance: distance,
            featureSimilarity,
          };
        })
        .filter((match) => match !== null)
        .sort(
          (a, b) =>
            a!.faceDistance +
            (1 - a!.featureSimilarity) -
            (b!.faceDistance + (1 - b!.featureSimilarity))
        );

      // Return best match if below threshold
      return matches.length > 0 && matches[0]!.faceDistance < 0.6
        ? matches[0]!.person
        : null;
    } catch (error) {
      console.error("Recognition error:", error);
      return null;
    }
  }

  // Extract features using MobileNet
  private async extractMobilenetFeatures(
    img: HTMLImageElement
  ): Promise<number[]> {
    const tensorImage = tf.browser.fromPixels(img);
    const features = await this.mobilenetModel.classify(tensorImage);
    return features.map((f) => f.probability);
  }

  // Calculate similarity between feature vectors
  private calculateFeatureSimilarity(
    features1: number[],
    features2: number[]
  ): number {
    if (features1.length !== features2.length) return 0;

    const cosineSimilarity =
      features1.reduce((sum, f1, i) => sum + f1 * features2[i], 0) /
      (Math.sqrt(features1.reduce((sum, f) => sum + f * f, 0)) *
        Math.sqrt(features2.reduce((sum, f) => sum + f * f, 0)));

    return cosineSimilarity;
  }

  // Clear recognition database
  clearDatabase() {
    this.personDatabase = [];
  }
}

export default new ImageRecognitionService();
