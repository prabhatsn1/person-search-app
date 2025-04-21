"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import * as blazeface from "@tensorflow-models/blazeface";
import * as tf from "@tensorflow/tfjs";

export default function RegisterStudent() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [picture, setPicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    };

    loadModel();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureFromWebcam = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPicture(imageSrc);
      setUsingCamera(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !rollNumber || !picture || !model) {
      setMessage({
        type: "error",
        text: "All fields are required and face detection model must be loaded",
      });
      return;
    }

    setLoading(true);

    try {
      // Extract face descriptor
      const img = document.createElement("img");
      img.src = picture;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const predictions = await model.estimateFaces(img, false);

      if (predictions.length === 0) {
        setMessage({
          type: "error",
          text: "No face detected in the image. Please try again.",
        });
        setLoading(false);
        return;
      }

      if (predictions.length > 1) {
        setMessage({
          type: "error",
          text: "Multiple faces detected. Please use an image with only one face.",
        });
        setLoading(false);
        return;
      }

      // Use the first prediction as our face descriptor
      const faceDescriptor = Array.from(predictions[0].probability);

      // Create form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("rollNumber", rollNumber);
      formData.append("picture", picture);
      formData.append("faceDescriptor", JSON.stringify(faceDescriptor));

      // Send to API
      const response = await fetch("/api/students", {
        method: "POST",
        body: JSON.stringify({
          name,
          rollNumber,
          picture,
          faceDescriptor,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Student registered successfully!",
        });
        setName("");
        setRollNumber("");
        setPicture(null);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Failed to register student",
        });
      }
    } catch (error) {
      console.error("Error registering student:", error);
      setMessage({
        type: "error",
        text: "An error occurred while processing the request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Register New Student</h2>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label
            htmlFor="rollNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Roll Number
          </label>
          <input
            type="text"
            id="rollNumber"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Student Picture
          </span>

          {usingCamera ? (
            <div className="space-y-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-64 object-cover rounded-md"
              />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={captureFromWebcam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Capture Photo
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="file"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setUsingCamera(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Use Camera
                </button>
              </div>

              {picture && (
                <div className="mt-4">
                  <Image
                    src={picture}
                    alt="Student preview"
                    width={300}
                    height={300}
                    className="rounded-md object-cover"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !model}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md ${
              loading || !model
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Register Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
