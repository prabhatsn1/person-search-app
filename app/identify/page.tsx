"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import * as blazeface from "@tensorflow-models/blazeface";
import * as tf from "@tensorflow/tfjs";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  picture: string;
}

export default function IdentifyStudent() {
  const [picture, setPicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [identifiedStudent, setIdentifiedStudent] = useState<Student | null>(
    null
  );

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
        setIdentifiedStudent(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureFromWebcam = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPicture(imageSrc);
      setUsingCamera(false);
      setIdentifiedStudent(null);
    }
  };

  const identifyStudent = async () => {
    if (!picture || !model) {
      setMessage({
        type: "error",
        text: "Please provide a picture and wait for face detection model to load",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

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

      // Send to API for identification
      const response = await fetch("/api/identify", {
        method: "POST",
        body: JSON.stringify({ faceDescriptor }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.student) {
          setIdentifiedStudent(result.student);
          setMessage({
            type: "success",
            text: "Student identified successfully!",
          });
        } else {
          setMessage({
            type: "error",
            text: "No matching student found in the database.",
          });
        }
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Failed to identify student",
        });
      }
    } catch (error) {
      console.error("Error identifying student:", error);
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
      <h2 className="text-2xl font-bold mb-6">Identify Student</h2>

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

      <div className="space-y-6">
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Upload Student Picture
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
                    alt="Student to identify"
                    width={300}
                    height={300}
                    className="rounded-md object-cover"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {picture && (
          <div className="flex justify-center">
            <button
              onClick={identifyStudent}
              disabled={loading || !model}
              className={`px-6 py-2 bg-green-600 text-white rounded-md ${
                loading || !model
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Identify Student"}
            </button>
          </div>
        )}

        {identifiedStudent && (
          <div className="mt-8 p-6 border border-green-200 bg-green-50 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Identified Student</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <Image
                  src={identifiedStudent.picture}
                  alt={identifiedStudent.name}
                  width={200}
                  height={200}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="w-full md:w-2/3">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <p className="text-lg">{identifiedStudent.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Roll Number:
                    </span>
                    <p className="text-lg">{identifiedStudent.rollNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
