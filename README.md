# Dutch MOMO Flipbook Component

Drop-in React menu flipbook component for an existing project.

The main file is `src/MomoFlipBook.jsx`. It renders the floating white menu viewer with page-flip controls, thumbnails, zoom, fullscreen, share, and close behavior. The component is meant to be toggled from a button in your existing website/app.

## Install In Existing Project

Install the flipbook dependency in your project:

```bash
npm install react-pageflip
```

Copy this file into your React project:

```text
src/MomoFlipBook.jsx
```

Then import and toggle it from any parent component:

```jsx
import { useState } from "react";
import MomoFlipBook from "./MomoFlipBook.jsx";

export default function MenuButton() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setMenuOpen(true)}>
        View Menu
      </button>

      <MomoFlipBook
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
```

## Custom Pages

By default, the component uses the 8848 Momo menu image URLs. You can pass your own page images:

```jsx
<MomoFlipBook
  open={menuOpen}
  onClose={() => setMenuOpen(false)}
  pages={[
    "/menu/page-1.jpg",
    "/menu/page-2.jpg",
    "/menu/page-3.jpg",
    "/menu/page-4.jpg",
  ]}
/>
```

## Local Preview

This repo includes a small Vite preview app so you can test the component by itself:

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```
