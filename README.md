# Person Search Application

## Overview

This is a Next.js TypeScript application that allows users to:

1. Enter person details (name, social media IDs, mobile number)
2. Upload a person's image
3. Search for a person by uploading an image

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/person-search-app.git
cd person-search-app
```

2. Install dependencies

```bash
npm install
```

3. Run the development server

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js
- TypeScript
- Material-UI
- Formik
- Yup
- React Dropzone

## Features

- Responsive design
- Form validation
- Image upload
- Basic search functionality

## Roadmap

- Implement actual image recognition
- Add backend integration
- Enhance search capabilities

## Limitations

- Currently uses local storage
- No persistent data storage
- Placeholder image comparison logic

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License.



# Person Search Application

## Project Structure
```
person-search-app/
│
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   ├── person-entry.tsx
│   │   └── search.tsx
│   └── styles/
│       └── globals.css
│
├── public/
│
├── package.json
└── tsconfig.json
```

## Setup Instructions
1. Clone the repository
2. Run `npm install`
3. Start development server with `npm run dev`

## Features
- Person details entry form
- Image upload functionality
- Basic person search mechanism

## Limitations
- Current implementation uses local storage
- Image recognition is a placeholder
- Requires actual backend integration for full functionality