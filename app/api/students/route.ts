import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, rollNumber, picture, faceDescriptor } = await req.json();

    // Validate required fields
    if (!name || !rollNumber || !picture || !faceDescriptor) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return NextResponse.json(
        { message: "A student with this roll number already exists" },
        { status: 409 }
      );
    }

    // Create new student
    const student = new Student({
      name,
      rollNumber,
      picture,
      faceDescriptor,
    });

    await student.save();

    return NextResponse.json(
      { message: "Student created successfully", student },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { message: error.message || "Error creating student" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const students = await Student.find({}).select("name rollNumber picture");

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching students" },
      { status: 500 }
    );
  }
}
