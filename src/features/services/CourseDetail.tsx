'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Course } from './courseData';

const initials = ['SA', 'RK', 'MP', 'JD'];

export default function CourseDetail({ course }: { course: Course }) {
  const [open, setOpen] = useState<boolean[]>(() => course.curriculum.map((_, i) => i === 0));

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const allOpen = open.every(Boolean);
  const toggleAll = () => setOpen(course.curriculum.map(() => !allOpen));
  const toggleOne = (i: number) => setOpen(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="course-detail">
      <section className="course-hero">
        <nav className="course-breadcrumb">
          <Link href="/services/it-training">Home</Link> <span>›</span> <strong>{course.title}</strong>
        </nav>
        <div className="course-hero-grid">
          <div className="course-hero-copy">
            <span className="course-badge">✦ {course.badge}</span>
            <h1>{course.title}</h1>
            <p className="course-tagline">{course.tagline}</p>
            <div className="course-meta">
              <span>📅 {course.duration}</span>
              <span>💻 Mode: {course.mode}</span>
            </div>
            <div className="course-trust">
              <div className="course-trust-avatars">
                {initials.map(name => <i key={name}>{name}</i>)}
              </div>
              <p>Thousands of students have started their careers after getting certified by Leafclutch.</p>
            </div>
            <div className="course-hero-actions">
              <span className="course-btn-primary is-disabled">Send Inquiry <b>→</b></span>
              <span className="course-btn-ghost is-disabled">Enroll Now</span>
            </div>
          </div>
          <div className="course-hero-visual">
            <span className="course-hero-icon">{course.icon}</span>
            {course.tools.slice(0, 3).map((tool, i) => (
              <span className={`course-hero-chip chip-${i + 1}`} key={tool}>{tool}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="course-body">
        <div className="course-main">
          <h2>Course Overview</h2>
          {course.overview.map((paragraph, i) => <p key={i}>{paragraph}</p>)}

          <h2>Tools Covered</h2>
          <p className="course-section-lead">Some of the major industry-relevant tools you&apos;ll work with in this course include:</p>
          <div className="course-tools">
            {course.tools.map(tool => <span className="course-tool-chip" key={tool}>{tool}</span>)}
          </div>

          <div className="course-curriculum-head">
            <h2>Curriculum</h2>
            <button type="button" className="course-expand-all" onClick={toggleAll}>{allOpen ? 'Collapse All' : 'Expand All'}</button>
          </div>
          <p className="course-section-lead">Our syllabus outlines are only the headlines of the major modules. To ensure a complete understanding of the course, we offer free counseling. Also, if you have specific modules in mind, you can customize the course. Send your inquiry today!</p>
          <div className="course-curriculum">
            {course.curriculum.map((lesson, i) => (
              <div className={`course-lesson${open[i] ? ' open' : ''}`} key={lesson.title}>
                <button type="button" className="course-lesson-head" onClick={() => toggleOne(i)}>
                  <span>{lesson.title}</span>
                  <b>{open[i] ? '−' : '+'}</b>
                </button>
                {open[i] && (
                  <ul className="course-lesson-body">
                    {lesson.topics.map(topic => <li key={topic}>{topic}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="course-sidebar">
          <div className="course-sidebar-card">
            <div className="course-sidebar-row"><strong>{course.duration}</strong><span>Duration</span></div>
            <div className="course-sidebar-row"><strong>{course.mode}</strong><span>Mode</span></div>
            <span className="course-btn-primary course-btn-block is-disabled">Send Inquiry <b>→</b></span>
            <span className="course-btn-outline course-btn-block is-disabled">Enroll Now</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
