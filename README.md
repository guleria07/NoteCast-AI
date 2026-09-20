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
- ⚙️ Automated CI/CD deployment using GitHub Actions
- 🚀 Automatic frontend deployment to Amazon S3

---

## 🏗️ AWS Architecture

```text
                              ┌──────────────────────┐
                              │        User          │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   NoteCast AI        │
                              │     Frontend         │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │    API Gateway       │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │      AWS Lambda      │
                              │  Backend Processing  │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │      Amazon S3        │
                              │  Document Storage     │
                              └──────────┬───────────┘
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                              ▼                     ▼
                    ┌──────────────────┐   ┌──────────────────┐
                    │  Amazon Textract │   │ Amazon Bedrock   │
                    │  Text Extraction │   │ AI Processing    │
                    └────────┬─────────┘   └────────┬─────────┘
                             │                      │
                             └──────────┬───────────┘
                                        ▼
                              ┌──────────────────────┐
                              │    Generated         │
                              │ Learning Content      │
                              │                      │
                              │ • Summaries          │
                              │ • Key Points         │
                              │ • Flashcards         │
                              │ • Quizzes            │
                              │ • Audio Content      │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │    Amazon Polly      │
                              │   Text-to-Speech     │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   NoteCast AI        │
                              │      Dashboard       │


---                              └──────────────────────┘
Frontend Deployment Architecture

The frontend is deployed separately from the backend processing bucket.

Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ├──────────────► CI Validation
    │
    ▼
AWS OIDC Authentication
    │
    ▼
IAM Deployment Role
    │
    ▼
Amazon S3
notecast-ai-frontend-2026
    │
    ▼
Live NoteCast AI Frontend

The backend processing resources remain separated from the frontend deployment bucket.

☁️ AWS Services Used
Amazon S3

Used for:

Storing uploaded documents
Storing processed/generated content
Storing generated audio
Hosting and deploying the NoteCast AI frontend
Amazon API Gateway

Provides the API endpoint used by the frontend to communicate with the AWS backend.

AWS Lambda

Used as part of the backend processing workflow to execute document-processing logic and coordinate AWS services.

Amazon Textract

Extracts text from uploaded PDF documents and study material.

Amazon Bedrock

Processes extracted content using foundation models to generate learning material such as:

Summaries
Explanations
Key points
Flashcards
Quizzes
Amazon Polly

Converts generated text into speech for audio-based learning.

AWS IAM

Used to control access to AWS resources and provide restricted permissions for the GitHub Actions deployment role.

GitHub Actions

Used to implement the CI/CD pipeline for automatically validating and deploying the NoteCast AI frontend.

GitHub OIDC

Used to securely authenticate GitHub Actions with AWS without storing long-lived AWS access keys or secret keys in GitHub.

🔄 How It Works
User uploads a PDF.
Frontend requests a presigned S3 upload URL.
PDF is uploaded directly to Amazon S3.
AWS processing pipeline starts.
Textract extracts document text.
Bedrock processes the extracted content.
Learning content is generated.
Generated results are stored in AWS.
Polly converts generated text into audio where applicable.
NoteCast AI dashboard displays the generated learning resources.
⚙️ DevOps & CI/CD

NoteCast AI includes a GitHub Actions CI/CD pipeline that automatically validates and deploys the frontend.

Continuous Integration

The CI pipeline:

Runs automatically when code is pushed to the main branch
Checks that required project files exist
Validates the frontend project structure
Supports manual workflow execution through GitHub Actions
Continuous Deployment

After successful CI validation:

GitHub Actions authenticates with AWS using GitHub OIDC.
AWS STS provides temporary credentials through the IAM deployment role.
The frontend is synchronized with the Amazon S3 deployment bucket.
Outdated frontend files are removed automatically.
The latest version of NoteCast AI becomes available through the S3 website.
CI/CD Workflow
Developer
    │
    ▼
Code Changes
    │
    ▼
Git Push
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ▼
┌───────────────────────────┐
│ CI Validation             │
│                           │
│ • Checkout repository     │
│ • Check project files     │
│ • Validate structure      │
└─────────────┬─────────────┘
              │
              ▼
           Success
              │
              ▼
┌───────────────────────────┐
│ AWS Authentication        │
│                           │
│ GitHub OIDC               │
│          ↓                │
│ AWS IAM Role              │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Continuous Deployment     │
│                           │
│ Deploy frontend to S3     │
│ Synchronize files         │
└─────────────┬─────────────┘
              │
              ▼
      Live NoteCast AI
Security

The CI/CD pipeline does not store long-lived AWS access keys in GitHub.

GitHub Actions uses OIDC to assume a restricted AWS IAM role with permissions specifically required for frontend deployment.

🖥️ Frontend

The frontend is built using:

HTML5
CSS3
JavaScript
Responsive dashboard UI

The application can also be run locally using VS Code Live Server.

The production frontend is deployed to Amazon S3 through the GitHub Actions CI/CD pipeline.

📂 Project Structure
NoteCast-AI/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── Assets/
│   ├── Document's Audio Podcast.png
│   ├── Document's Flashcards.png
│   ├── Document's Key Points.png
│   ├── Document's MCQ's.png
│   ├── Document's Summary.png
│   ├── Index.html Frontend.png
│   ├── Notecast Dashboard.png
│   ├── Notecast's Benefits.png
│   ├── Notecast's CSS.png
│   ├── Notecast's Javascript.png
│   ├── Notecast's Lambda function.png
│   ├── Notecast's S3 Bucket.png
│   ├── PDF File Uploaded.png
│   └── Uploads in S3 Bucket.png
│
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
🔐 Security

Security considerations implemented in the project include:

The frontend does not contain AWS access keys or secret credentials.
Documents are uploaded using presigned S3 URLs rather than exposing AWS credentials in the browser.
Sensitive AWS credentials and environment files are excluded using .gitignore.
GitHub Actions uses OIDC instead of storing long-lived AWS credentials.
The GitHub Actions IAM role is restricted to the frontend deployment bucket.
The backend processing bucket is kept separate from the frontend deployment bucket.
📸 Screenshots

Project screenshots are available in the Assets folder.

Application

The screenshots include:

NoteCast AI Dashboard
PDF Upload
Document Processing
Generated Summary
Key Points
Flashcards
Quiz
Podcast / Audio Learning
Application Benefits
AWS Infrastructure

Screenshots also demonstrate:

Amazon S3
Uploaded documents
Lambda function
AWS processing components
Frontend deployment
DevOps

The repository also includes screenshots demonstrating:

GitHub repository
GitHub Actions workflow
Successful CI validation
Successful frontend deployment
AWS IAM OIDC configuration
S3 frontend deployment
🎯 Project Objective

The goal of NoteCast AI is to make traditional study material easier to consume by transforming documents into different learning formats.

Instead of reading the same notes repeatedly, students can use summaries, key points, flashcards, quizzes and audio-based learning to revise their material.

The project also demonstrates how AWS cloud services and DevOps practices can be combined to build and deploy a cloud-based AI application.

🔮 Future Improvements

Planned improvements include:

More advanced quiz generation and scoring
Improved podcast/audio generation
User authentication
Persistent user learning history
Progress tracking
Support for more document formats
Improved AI-generated explanations
Enhanced learning analytics
Custom user learning profiles
🧑‍💻 Technologies
Frontend

HTML5 • CSS3 • JavaScript

Cloud & AI

Amazon S3 • API Gateway • AWS Lambda • Amazon Textract • Amazon Bedrock • Amazon Polly • AWS IAM

DevOps

Git • GitHub • GitHub Actions • GitHub OIDC • AWS IAM • CI/CD

Development

VS Code

📌 Project Status

The core NoteCast AI document processing workflow is implemented and connected to the frontend.

The application integrates AWS services for document storage, text extraction, AI processing and audio generation.

The frontend is deployed through an automated GitHub Actions CI/CD pipeline using AWS OIDC and a restricted IAM deployment role.

👨‍💻 Author

Abhishek Guleria

B.Tech Computer Science Engineering

⭐ If you find this project interesting, feel free to explore the repository.
