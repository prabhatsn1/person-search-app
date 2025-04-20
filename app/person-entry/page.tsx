"use client";

import React, { useState } from "react";
import { Box, Button, TextField, Typography, Grid, Paper } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Validation schema
const PersonEntrySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Name is required"),
  instagramId: Yup.string(),
  facebookId: Yup.string(),
  mobileNumber: Yup.string().matches(
    /^[0-9]{10}$/,
    "Mobile number must be 10 digits"
  ),
});

const PersonEntryPage: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      instagramId: "",
      facebookId: "",
      mobileNumber: "",
    },
    validationSchema: PersonEntrySchema,
    onSubmit: (values) => {
      // Store data in local storage or send to backend
      localStorage.setItem(
        "personDetails",
        JSON.stringify({
          ...values,
          image: image ? URL.createObjectURL(image) : null,
        })
      );
      router.push("/search");
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(file);
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 8,
      }}
    >
      <Typography component="h1" variant="h5">
        Enter Person Details
      </Typography>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 3,
          width: "100%",
          maxWidth: 500,
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                id="instagramId"
                name="instagramId"
                label="Instagram ID"
                value={formik.values.instagramId}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                id="facebookId"
                name="facebookId"
                label="Facebook ID"
                value={formik.values.facebookId}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                id="mobileNumber"
                name="mobileNumber"
                label="Mobile Number"
                value={formik.values.mobileNumber}
                onChange={formik.handleChange}
                error={
                  formik.touched.mobileNumber &&
                  Boolean(formik.errors.mobileNumber)
                }
                helperText={
                  formik.touched.mobileNumber && formik.errors.mobileNumber
                }
              />
            </Grid>
            <Grid size={12}>
              <Box
                {...getRootProps()}
                sx={{
                  border: "2px dashed grey",
                  padding: 2,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                {image ? (
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Uploaded"
                    width={200}
                    height={200}
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
            <Grid size={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Save and Continue to Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PersonEntryPage;
