# Kerem Düz - Full Stack Portfolio Website

**Live Demo:** [www.keremduz.com](https://www.keremduz.com)  
**GitHub Repository:** [https://github.com/KeremDuz/kerem_personal_portfolio](https://github.com/KeremDuz/kerem_personal_portfolio)

## Project Title and Description
**Kerem Düz Portfolio** is an interactive, full-stack personal website designed to showcase professional skills, timeline experiences, GitHub activity, travel logs, projects, and certifications. Built with a futuristic "cyber-grid" / dark mode aesthetic, the platform leverages a Next.js React frontend coupled with a robust Express / Node.js backend. The site uses 3D elements (such as TravelGlobe) and is designed to integrate an AI advisor in future phases.

## Setup and Run Instructions

This project is a monorepo that contains both the React frontend and Node.js backend. 

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- MongoDB Atlas or local MongoDB instance (Requires setting up an `.env` file with `MONGODB_URI` inside the `backend` directory)
- Cloudinary (for image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KeremDuz/kerem_personal_portfolio.git
   cd kerem_personal_portfolio
   ```

2. **Install all dependencies:**
   There is a package script available to install both frontend and backend dependencies at once:
   ```bash
   npm run install:all
   ```
   *(Alternatively, you can manually run `npm install` inside both the `/frontend` and `/backend` folders).*

3. **Environment Setup:**
   Ensure both your `/frontend` and `/backend` directories have the proper `.env` variables configured based on the provided `.env.example` files (you may have to create them). The backend typically requires the `PORT`, `MONGODB_URI`, `CLOUDINARY_URL`, etc.

### Running the Application

To run both the frontend and backend simultaneously in development mode, run from the root directory:
```bash
npm run dev
```

Alternatively, you run them separately:
- **Backend Only**: `npm run dev:backend`
- **Frontend Only**: `npm run dev:frontend`

The backend API will run on the port specified in your `backend/.env` file.

## Technologies Used

**Frontend**
- Next.js (React 19)
- Tailwind CSS
- Framer Motion
- Three.js & React-Globe.gl (for 3D features)
- Lucide React (Icons)
- TypeScript

**Backend**
- Node.js & Express
- MongoDB (via Mongoose)
- TypeScript (TSX for development execution)
- Express Rate Limit & Helmet 
- JsonWebToken & Bcryptjs (Authentication)
- Zod (Validation)
- Cloudinary & Multer (Storage)

**AI / Agent Demo**
- CrewAI
- LangGraph
- Model Context Protocol (MCP)
- FastAPI

## CrewAI Agent Flow

The CrewAI endpoint (`POST /ask`) runs a sequential multi-agent workflow:

- `cv_researcher`: summarizes Kerem Düz profile/CV context.
- `cti_expert`: searches current CVE and vulnerability topics with DuckDuckGo.
- `breach_intel_expert`: researches hacked companies, breach timelines, attack vectors, impact, leaked data types, and defensive lessons.
- `spokesperson`: combines the previous agent outputs into a visitor-friendly Turkish answer.

The breach intelligence agent can optionally send alerts through a webhook. Set
`BREACH_ALERT_WEBHOOK_URL` in the root `.env` file to enable notifications.
For phone push notifications, install the ntfy mobile app, subscribe to a private
topic, and set the webhook URL to that topic:

```env
BREACH_ALERT_WEBHOOK_URL=https://ntfy.sh/your-private-topic-name
BREACH_ALERT_WEBHOOK_FORMAT=ntfy
```

## MCP Classroom Demo

This project includes a visible MCP demonstration inside the AI assistant flow.
The MCP server is defined in `crewai_api/mcp_server.py` and exposes:

- `resource`: `portfolio://kerem/profile`
- `tool`: `get_contact_info`
- `tool`: `classify_portfolio_question`
- `tool`: `answer_from_portfolio_context`
- `prompt`: `portfolio_assistant_prompt`

The FastAPI endpoint `POST /mcp-demo` acts as an MCP client. It initializes the
MCP session, lists tools/resources/prompts, reads the portfolio resource, calls
tools, and returns both the final answer and a step-by-step trace.

Run the agent API:

```bash
./.venv-crewai/bin/python -m uvicorn crewai_api.app:app --host 0.0.0.0 --port 8010 --reload
```

Test the MCP endpoint:

```bash
curl -X POST http://localhost:8010/mcp-demo \
  -H "Content-Type: application/json" \
  --data '{"question":"Kerem kimdir ve iletişim bilgisini MCP ile getir."}'
```

In the website chat widget, select the `MCP` mode to show the same process and
result in the UI.

## Planning Document
The detailed project planning and AI concept architecture can be found in the attached document:
* **Kerem_Duz_Planning_Document.pdf**
*(Please reference the accompanying PDF version of the planning document).*
