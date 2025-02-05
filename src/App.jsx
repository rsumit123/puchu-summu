import React from 'react';
import PhotoGallery from './components/PhotoGallery';
import Calendar from './components/Calendar';
import FunMoments from './components/FunMoments';
import SpecialMessage from './components/SpecialMessage';
import WordCloud from './components/WordCloud';
import HeartAnimation from './components/HeartAnimation';
import ScrollArrow from './components/ScrollArrow';
import ScrollUpArrow from './components/ScrollUpArrow';
import DisableScroll from './components/DisableScroll';
import './App.css';

const App = () => {
  return (
    <div className="App">
      {/* <DisableScroll /> */}
      <HeartAnimation />
      <header className="App-header">
        <h1>Puchu Summu Love!</h1>
      </header>
      <main>
        {/* Section 1: only down arrow */}
        <section id="section-1">
          <PhotoGallery />
          <ScrollArrow targetId="section-2" />
        </section>

        {/* Section 2: up arrow and down arrow */}
        <section id="section-2">
          <ScrollUpArrow targetId="section-1" />
          <Calendar />
          <ScrollArrow targetId="section-3" />
        </section>

        {/* Section 3: up arrow and down arrow */}
        <section id="section-3">
          <ScrollUpArrow targetId="section-2" />
          <FunMoments />
          <ScrollArrow targetId="section-4" />
        </section>

        {/* Section 4: up arrow and down arrow */}
        <section id="section-4">
          <ScrollUpArrow targetId="section-3" />
          <SpecialMessage />
          <ScrollArrow targetId="section-5" />
        </section>

        {/* Section 5: only up arrow */}
        <section id="section-5">
          <ScrollUpArrow targetId="section-4" />
          <WordCloud />
          {/* Last section: no down arrow */}
        </section>
      </main>
    </div>
  );
};

export default App;
