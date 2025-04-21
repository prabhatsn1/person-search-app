import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const student = await Student.findById(params.id).select("-faceDescriptor");

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const student = await Student.findByIdAndDelete(params.id);

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { message: error.message || "Error deleting student" },
      { status: 500 }
    );
  }
}
