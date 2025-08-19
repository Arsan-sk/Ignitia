# Ignitia 🚀🔥  
**Igniting Innovation, Fueling Competition**  

Ignitia is a next-generation **hackathon & event management platform** that brings together **universities, student communities, companies, and event organizers**.  
It empowers organizers to host world-class events, enables participants to collaborate and shine, and creates transparency with dynamic leaderboards, scoring, and recognition.  

Think of Ignitia as the **arena where ideas rise and spark innovation** 🌟  

---

## ✨ Features

### 👩‍💻 For Participants
- Browse upcoming hackathons & events in a personalized feed  
- Apply as an individual or form teams with friends (invite system like social media)  
- Submit projects (GitHub, videos, PDFs, posters, etc.) via round-based submission forms  
- Track progress across rounds with transparent scoring and ranking  
- Earn certificates, badges, and trophies for achievements  
- Build a **social profile** (like Instagram + LinkedIn) showcasing wins, teams, and projects  
- Follow friends, teams, and organizations for updates  

### 🏢 For Organizers
- **Create & manage events** (Hackathons, Tech Fests, Conferences, etc.) in a single-page form  
  - Define event details, deadlines, and number of rounds  
  - Configure round-specific submission forms (with file upload, GitHub, or external links)  
  - Set scoring criteria for each round  
- Manage participants and teams dynamically  
- Publish announcements & FAQs (community-style updates)  
- Evaluate submissions and assign points → leaderboard updates automatically  
- Generate certificates for winners/participants  

### 🏫 For Organizations
- Dedicated organizational profiles (banner, logo, description)  
- Post events, updates, and opportunities  
- Attract top student talent and build community  
- Access analytics (registrations, submissions, winners by region/university)  

---

## 🏗️ Architecture

Ignitia follows a **modular architecture** for scalability and clarity:

### **Frontend**
- Next.js / React (Modern, responsive, and animated UI)  
- TailwindCSS + Framer Motion (beautiful transitions, animations)  
- Light & Dark Mode:  
  - Light → Professional (LinkedIn vibe)  
  - Dark → Energetic, modern (Discord/Instagram vibe)  

### **Backend**
- Node.js + Express  
- RESTful APIs for all modules (auth, events, teams, submissions, leaderboard, etc.)  
- JWT authentication for secure user sessions  

### **Database (MongoDB Atlas)**  
- Database: `Ignitia`  
- Core Collections:  
  - `users` → all participants & organizers  
  - `organizations` → universities, companies, communities  
  - `events` → hackathons, fests, conferences  
  - `teams` → team details for each event  
  - `submissions` → project uploads per round  
  - `rounds` → round definitions + scoring criteria  
  - `leaderboards` → ranking & results  
  - `announcements` → organizer posts, Q&A  
  - `certificates` → issued records  

---

## 🎨 UI/UX Vision
- **Profiles** like Instagram + LinkedIn hybrid (banner, bio, counts for friends/followers/events/wins)  
- **Feed** of upcoming events & hackathons (separate feeds for each)  
- **Team Profiles** to showcase collaborations & history  
- **Leaderboards** visible per event and globally (across universities, states, friends, etc.)  
- **Gamified elements**: Badges, trophies, and achievement highlights  
- **Smooth transitions & micro-interactions** for a premium experience  

---

## ⚙️ Tech Stack
- **Frontend:** React.js, Next.js, TailwindCSS, Framer Motion  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas (hosted cluster)  
- **Authentication:** JWT + bcrypt  
- **Hosting:** Vercel / Netlify (Frontend), Render / Railway / Heroku (Backend)  
- **Other Tools:**  
  - Multer (file uploads)  
  - Cloudinary (media hosting)  
  - Nodemailer (email notifications)  

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)  
- MongoDB Atlas account  
- Git installed  

### Setup
```bash
# 1. Clone repo
git clone https://github.com/Arsan-sk/Ignitia.git

# 2. Enter project
cd Ignitia

# 3. Install dependencies
npm install

# 4. Add .env file
ATLAS_URL="mongodb+srv://arsansk09:Ignitia2025@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="yourSecretKeyHere"

# 5. Run setup
npm run mongodb:check
npm run mongodb:setup

# 6. Start dev server
npm run dev

---

## 📊 Future Enhancements
- **AI-powered judging assistance**  
  Automatically evaluate GitHub repositories, code quality, and presentation materials to help organizers and judges.  

- **Built-in video submission & judging panel dashboard**  
  Direct uploads with integrated review tools for seamless judging.  

- **Mobile App (React Native)**  
  Companion mobile app for participants and organizers to track events on the go.  

- **Event sponsorship module**  
  Allow sponsors to showcase their brand, provide perks, and support events directly within the platform.  

- **Advanced analytics for universities & organizers**  
  Insights into participation trends, regional performance, and leaderboard breakdowns.  

---

## 🤝 Contributing
We welcome contributions from the community! Here’s how you can help:  

1. **Fork** the repository  
2. **Create** a feature branch (`git checkout -b feature/YourFeatureName`)  
3. **Commit** your changes (`git commit -m "Add new feature"`)  
4. **Push** to your branch (`git push origin feature/YourFeatureName`)  
5. **Open a Pull Request** 🎉  

Please also:  
- Open an **Issue** for bug reports or feature requests  
- Keep commits clean and descriptive  
- Follow coding style guidelines used in the repo  

---

## 👨‍💻 Author
Built with ❤️ by **[Arsan-sk](https://github.com/Arsan-sk)**  

- 🌐 GitHub: [@Arsan-sk](https://github.com/Arsan-sk)  
- ✉️ Contact: _you can add your email here if you’d like_  

---

## 📜 License
This project is licensed under the **MIT License** — you’re free to use, modify, and distribute with attribution.  

---

## 🙏 Acknowledgements
- **MongoDB Atlas** for database hosting  
- **Next.js, Node.js, Express** for powering the app  
- **Framer Motion & Tailwind** for the smooth, modern UI  
- Inspiration from platforms like **Unstop, LinkedIn, Instagram, and Discord**  

---
