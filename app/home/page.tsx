"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-blue-600 text-white p-4 rounded-t-lg shadow">
          <h1 className="text-2xl font-bold">Student Recognition System</h1>
        </header>
        <div className="bg-white p-6 rounded-b-lg shadow">
          <div className="space-y-8">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold mb-4">
                Student Recognition System
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Store student details with facial recognition capability. Upload
                a student picture to identify them automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/register"
                className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              >
                <h3 className="text-xl font-semibold mb-2">
                  Register New Student
                </h3>
                <p className="text-gray-600">
                  Add a new student with their name, roll number, and picture.
                </p>
              </Link>

              <Link
                href="/identify"
                className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
              >
                <h3 className="text-xl font-semibold mb-2">Identify Student</h3>
                <p className="text-gray-600">
                  Upload a picture to identify the student and view their
                  details.
                </p>
              </Link>

              <Link
                href="/students"
                className="block p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
              >
                <h3 className="text-xl font-semibold mb-2">
                  View All Students
                </h3>
                <p className="text-gray-600">
                  Browse all registered students and their information.
                </p>
              </Link>

              <div className="block p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">How It Works</h3>
                <p className="text-gray-600">
                  Our system uses facial recognition to identify students from
                  their pictures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
