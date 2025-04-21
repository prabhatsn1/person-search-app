import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";

// Helper function to calculate Euclidean distance between two face descriptors
function euclideanDistance(
  descriptor1: number[],
  descriptor2: number[]
): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error("Descriptors must have the same length");
  }

  return Math.sqrt(
    descriptor1.reduce((sum, value, i) => {
      const diff = value - descriptor2[i];
      return sum + diff * diff;
    }, 0)
  );
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { faceDescriptor } = await req.json();

    // Validate required fields
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { message: "Face descriptor is required and must be an array" },
        { status: 400 }
      );
    }

    // Get all students from database
    const students = await Student.find({});

    if (students.length === 0) {
      return NextResponse.json(
        { message: "No students found in the database" },
        { status: 404 }
      );
    }

    // Find the student with the most similar face descriptor
    let closestStudent = null;
    let minDistance = Infinity;

    for (const student of students) {
      try {
        const distance = euclideanDistance(
          faceDescriptor,
          student.faceDescriptor
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestStudent = student;
        }
      } catch (error) {
        console.error(`Error comparing with student ${student._id}:`, error);
        // Continue with next student
      }
    }

    // Define a threshold for face matching (may need adjustment)
    const MATCH_THRESHOLD = 0.6;

    if (closestStudent && minDistance < MATCH_THRESHOLD) {
      // Return identified student without the face descriptor
      const { _id, name, rollNumber, picture } = closestStudent;
      return NextResponse.json({
        student: { _id, name, rollNumber, picture },
        distance: minDistance,
      });
    } else {
      return NextResponse.json(
        { message: "No matching student found" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Error identifying student:", error);
    return NextResponse.json(
      { message: error.message || "Error identifying student" },
      { status: 500 }
    );
  }
}
