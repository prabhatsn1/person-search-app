import mongoose from "mongoose";

export interface IStudent {
  name: string;
  rollNumber: string;
  picture: string;
  faceDescriptor: number[];
}

const StudentSchema = new mongoose.Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this student"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    rollNumber: {
      type: String,
      required: [true, "Please provide a roll number for this student"],
      unique: true,
    },
    picture: {
      type: String,
      required: [true, "Please provide a picture for this student"],
    },
    faceDescriptor: {
      type: [Number],
      required: [true, "Face descriptor is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Student ||
  mongoose.model<IStudent>("Student", StudentSchema);
