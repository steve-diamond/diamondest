import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'school.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'teacher', 'student'))
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    subject TEXT
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    grade TEXT
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    teacher_id INTEGER,
    FOREIGN KEY(teacher_id) REFERENCES teachers(id)
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    course_id INTEGER,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(course_id) REFERENCES courses(id),
    UNIQUE(student_id, course_id)
  );
`);

// Seed initial admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', 'admin123', 'admin');
  
  // Seed some initial data
  const t1 = db.prepare('INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)').run('John Smith', 'john@school.com', 'Mathematics');
  const t2 = db.prepare('INSERT INTO teachers (name, email, subject) VALUES (?, ?, ?)').run('Sarah Wilson', 'sarah@school.com', 'Science');
  
  db.prepare('INSERT INTO students (name, email, grade) VALUES (?, ?, ?)').run('Alice Brown', 'alice@student.com', '10th');
  db.prepare('INSERT INTO students (name, email, grade) VALUES (?, ?, ?)').run('Bob Miller', 'bob@student.com', '11th');
  
  db.prepare('INSERT INTO courses (name, description, teacher_id) VALUES (?, ?, ?)').run('Algebra I', 'Basic algebra concepts', t1.lastInsertRowid);
  db.prepare('INSERT INTO courses (name, description, teacher_id) VALUES (?, ?, ?)').run('Biology', 'Introduction to living organisms', t2.lastInsertRowid);
}

export default db;
