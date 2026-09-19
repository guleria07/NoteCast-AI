# 🎧 NoteCast AI

> Transform your notes into structured learning content with AI.

NoteCast AI is an AI-powered learning platform that converts uploaded notes and PDF documents into useful learning resources.

Users can upload their study material and process it through an AWS-powered pipeline to extract and transform the content into structured learning material.

---

## 🚀 Features

- 📄 Upload PDF notes and study material
- 📝 AI-generated summaries
- 💡 Key points extraction
- 🗂️ Flashcards for revision
- 🧠 Quiz-based learning
- 🎙️ Podcast / audio learning
- ☁️ AWS cloud-based processing
- 🔐 Secure document upload using Amazon S3 presigned URLs

---

## 🏗️ AWS Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  NoteCast AI     │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  API Gateway     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Amazon S3      │
                    │ Document Storage │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ AWS Processing   │
                    │    Pipeline      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Textract │   │ Bedrock  │   │  Polly   │
        └──────────┘   └──────────┘   └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌──────────────────┐
                    │ Generated        │
                    │ Learning Content │
                    └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ NoteCast AI      │
                    │    Dashboard     │
                    └──────────────────┘
## AWS Services Used
Amazon S3

Used for storing uploaded documents and generated learning content.

Amazon API Gateway

Provides the API endpoint used by the frontend to communicate with the AWS backend.

Amazon Textract

Extracts text from uploaded documents.

Amazon Bedrock

Processes extracted content using foundation models to generate learning material such as summaries, explanations, flashcards and quizzes.

Amazon Polly

Converts generated text into speech for audio-based learning.

AWS Lambda

Used as part of the backend processing workflow to execute document-processing logic.
                   🔄 How It Works
                   1. User uploads a PDF
          ↓
2. Frontend requests a presigned S3 upload URL
          ↓
3. PDF is uploaded directly to Amazon S3
          ↓
4. AWS processing pipeline starts
          ↓
5. Textract extracts document text
          ↓
6. Bedrock processes the extracted content
          ↓
7. Learning content is generated
          ↓
8. Generated results are stored in AWS
          ↓
9. NoteCast AI dashboard displays the results

🖥️ Frontend

The frontend is built using:

HTML5
CSS3
JavaScript
Responsive dashboard UI

The application can be run locally using VS Code Live Server.

📂 Project Structure
NoteCast-AI/
│
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
🎯 Project Objective

The goal of NoteCast AI is to make traditional study material easier to consume by transforming documents into different learning formats.

Instead of reading the same notes repeatedly, students can use summaries, key points, flashcards, quizzes and audio-based learning to revise their material.

🔐 Security

The frontend does not contain AWS access keys or secret credentials.

Documents are uploaded using presigned S3 URLs rather than exposing AWS credentials in the browser.

Sensitive AWS credentials and environment files are excluded using .gitignore.

📸 Screenshots

Screenshots of the NoteCast AI dashboard can be added here.

Example:

Add your project screenshots here.
🔮 Future Improvements

Planned improvements include:

More advanced quiz generation and scoring
Improved podcast/audio generation
User authentication
Persistent user learning history
Progress tracking
More document formats
Improved AI-generated explanations
Deployment of the frontend for public access
🧑‍💻 Technologies

Frontend

HTML • CSS • JavaScript

Cloud & AI

AWS S3 • API Gateway • Lambda • Textract • Bedrock • Polly

Development

VS Code • Git • GitHub

📌 Project Status

The core document upload and AWS processing workflow is implemented and connected to the NoteCast AI frontend.

Some learning features are still being improved and are listed under Future Improvements.

👨‍💻 Author

Abhishek Guleria

B.Tech Computer Science Engineering

⭐ If you find this project interesting, feel free to explore the repository.


---
