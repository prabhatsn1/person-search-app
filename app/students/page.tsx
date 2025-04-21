"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  picture: string;
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        setStudents(data.students);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = searchTerm
    ? students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : students;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Students</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading students...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-8">
          <p>No students found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="h-48 relative">
                <Image
                  src={student.picture}
                  alt={student.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-gray-600">
                  Roll Number: {student.rollNumber}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => (window.location.href = "/")}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back to Home
        </button>
        <button
          onClick={() => (window.location.href = "/register")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Register New Student
        </button>
      </div>
    </div>
  );
}
