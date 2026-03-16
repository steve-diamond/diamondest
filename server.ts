import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Students
  app.get("/api/students", (req, res) => {
    const students = db.prepare('SELECT * FROM students').all();
    res.json(students);
  });

  app.post("/api/students", (req, res) => {
    const { name, email, grade } = req.body;
    try {
      const result = db.prepare('INSERT INTO students (name, email, grade) VALUES (?, ?, ?)').run(name, email, grade);
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.put("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, grade } = req.body;
    try {
      db.prepare('UPDATE students SET name = ?, email = ?, grade = ? WHERE id = ?').run(name, email, grade, id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });

  app.delete("/api/students/:id", (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Teachers
  app.get("/api/teachers", (req, res) => {
    const teachers = db.prepare('SELECT * FROM teachers').all();
    res.json(teachers);
  });

  app.post("/api/teachers", (req, res) => {
    const { name, email, subject } = req.body;
    try {
      const result = db.prepare('INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)').run(name, email, subject);
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.put("/api/teachers/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, subject } = req.body;
    try {
      db.prepare('UPDATE teachers SET name = ?, email = ?, subject = ? WHERE id = ?').run(name, email, subject, id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });

  app.delete("/api/teachers/:id", (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Courses
  app.get("/api/courses", (req, res) => {
    const courses = db.prepare(`
      SELECT courses.*, teachers.name as teacher_name 
      FROM courses 
      LEFT JOIN teachers ON courses.teacher_id = teachers.id
    `).all();
    res.json(courses);
  });

  app.post("/api/courses", (req, res) => {
    const { name, description, teacher_id } = req.body;
    const result = db.prepare('INSERT INTO courses (name, description, teacher_id) VALUES (?, ?, ?)').run(name, description, teacher_id);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/courses/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, teacher_id } = req.body;
    db.prepare('UPDATE courses SET name = ?, description = ?, teacher_id = ? WHERE id = ?').run(name, description, teacher_id, id);
    res.json({ success: true });
  });

  app.delete("/api/courses/:id", (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM courses WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Enrollments
  app.get("/api/enrollments", (req, res) => {
    const enrollments = db.prepare(`
      SELECT enrollments.*, students.name as student_name, courses.name as course_name
      FROM enrollments
      JOIN students ON enrollments.student_id = students.id
      JOIN courses ON enrollments.course_id = courses.id
    `).all();
    res.json(enrollments);
  });

  app.post("/api/enrollments", (req, res) => {
    const { student_id, course_id } = req.body;
    try {
      const result = db.prepare('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)').run(student_id, course_id);
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Student already enrolled in this course" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
