# RefactorAI - Monorepo

“Your codebase. Understood.”

RefactorAI is a modern developer SaaS dashboard that analyzes GitHub repositories using AI to provide insights about architecture, technical debt, and code patterns.

## Project Structure

- **`/frontend`**: Next.js 15 App Router, TypeScript, Tailwind CSS, Recharts, Framer Motion.
- **`/backend`**: FastAPI (Python), providing analysis endpoints and GitHub integration stubs.

## Getting Started

### Frontend

1.  Navigate to frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```

### Backend (FastAPI)

1.  Navigate to backend:
    ```bash
    cd backend
    ```
2.  Create and activate virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the API:
    ```bash
    uvicorn main:app --reload
    ```
5.  Access API documentation at: `http://localhost:8000/docs`

## Design Aesthetic

- **Minimalist Dark Mode**: Optimized for primary developer focus.
- **Glassmorphism**: Subtle backgrounds and premium border treatments.
- **Modern UI**: Consistent sidebar navigation, real-time charts, and AI-driven insights.
