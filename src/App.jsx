import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home       from './pages/public/Home';
import ChoosePage from './pages/public/ChoosePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChoosePage />} />
        <Route path="/iit-tech/:name"       element={<Home />} />
        <Route path="/iit-genie-info/:name" element={<Home />} />
        <Route path="/iit-li-arch/:name"    element={<Home />} />
        <Route path="/isb/:name"            element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
