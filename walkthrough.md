# Dave Madigan Portfolio - Walkthrough

I have successfully scaffolded a modern, minimalist portfolio for Dave Madigan using **Vite + React**.

## 🚀 Getting Started

Since I did not have access to Node.js in this environment, **you will need to install the dependencies and start the server manually.**

1.  Open your terminal in the project folder:
    ```bash
    cd /Users/ciaranmadigan/Desktop/dave_madigan_portfolio
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the link shown in the terminal (usually `http://localhost:5173`).

## 🎨 Design Highlights

-   **Minimalist & Slick**: Used a dark theme (`#0a0a0a`) with subtle gray text and a "red" accent color for selection, giving it a premium art-gallery feel.
-   **Animations**: Implemented `framer-motion` for:
    -   Smooth fade-ins for text.
    -   A "magical" slow-spinning abstract background in the Hero section to hint at the "digital aesthetics" mentioned in his bio.
    -   Interactive hover states on the exhibitions list.
-   **Exhibitions Timeline**: Transformed the long list of exhibitions into a structured, year-by-year timeline. This makes it much easier for curators and visitors to scan his history.
-   **Gallery**: Added a responsive grid of works with a custom full-screen lightbox.
    -   Click any image to expand.
    -   Use Arrow keys or on-screen buttons to navigate.
    -   Press Escape to close.

## 📂 Project Structure

-   `src/data/content.js`: Contains all the text content **and gallery images**.
    -   Look for the `galleryImages` array to add your own image URLs, titles, and years.
-   `src/components/`: Modular components for each section (`Hero`, `About`, `Gallery`, `Exhibitions`, `Contact`).
-   `src/index.css`: Global styles and typography variables.

## 🔧 Next Steps

-   **Images**: I used a CSS gradient for the hero background. You can replace this with an actual image of Dave's work by editing `src/components/Hero.jsx`.
-   **Deployment**: This project is ready to be deployed to Vercel or Netlify. Just connect your GitHub repository.
