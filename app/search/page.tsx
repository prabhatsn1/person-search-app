"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import ImageRecognitionService from "@/services/ImageRecognitionService";

const SearchPage: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [storedPersonDetails, setStoredPersonDetails] = useState<any>(null);
  const [recognizedPerson, setRecognizedPerson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize recognition service and load stored persons
    const initRecognition = async () => {
      const storedDetails = localStorage.getItem("personDetails");
      if (storedDetails) {
        const personData = JSON.parse(storedDetails);

        // Add person to recognition database
        try {
          await ImageRecognitionService.addPerson({
            id: Date.now().toString(),
            name: personData.name,
            image: personData.image,
            instagramId: personData.instagramId,
            facebookId: personData.facebookId,
            mobileNumber: personData.mobileNumber,
          });
        } catch (err) {
          console.error("Failed to add person to recognition database", err);
        }
      }
    };

    initRecognition();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setUploadedImage(file);
      setRecognizedPerson(null);
      setError(null);
    },
  });

  const handleSearch = async () => {
    if (!uploadedImage) return;

    setIsLoading(true);
    setError(null);
    setRecognizedPerson(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(uploadedImage);
      reader.onloadend = async () => {
        try {
          const result = await ImageRecognitionService.recognizePerson(
            reader.result as string
          );

          if (result) {
            setRecognizedPerson(result);
          } else {
            setError("No matching person found.");
          }
        } catch (err) {
          setError("Error in recognition process.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
    } catch (err) {
      setError("Failed to process image.");
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setRecognizedPerson(null);
    setError(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 8,
      }}
    >
      <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
        Upload Photo to Search
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: 500, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed grey",
              padding: 2,
              textAlign: "center",
              cursor: "pointer",
              minHeight: 300,
            }}
          >
            <input {...getInputProps()} />
            {uploadedImage ? (
              <Image
                src={URL.createObjectURL(uploadedImage)}
                alt="Uploaded"
                width={300}
                height={300}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Typography>
                {isDragActive
                  ? "Drop the image here ..."
                  : "Drag 'n' drop an image, or click to select"}
              </Typography>
            )}
          </Box>
        </Grid>

        {(recognizedPerson || isLoading) && (
          <Grid size={{ xs: 12, md: 6 }}>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Card sx={{ maxWidth: 345 }}>
                {recognizedPerson.image && (
                  <CardMedia
                    component="img"
                    height="300"
                    image={recognizedPerson.image}
                    alt="Recognized Person"
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {recognizedPerson.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Instagram: {recognizedPerson.instagramId || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Facebook: {recognizedPerson.facebookId || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mobile: {recognizedPerson.mobileNumber || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        )}

        <Grid size={12} container spacing={2} justifyContent="center">
          {uploadedImage && (
            <Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={isLoading}
              >
                Search
              </Button>
            </Grid>
          )}
          <Grid>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchPage;
