# Ten Useful Web Apps

A zero-build collection of ten browser applications. Every app works directly from static files, stores its data in localStorage, and is ready for GitHub Pages.

## Run locally

\`\`\`bash
python3 -m http.server 8080
\`\`\`

Then visit http://localhost:8080.

## Test

\`\`\`bash
npm test
\`\`\`

## Deploy

Push the repository to GitHub, choose **GitHub Actions** as the Pages source in repository settings, and the included workflow publishes the repository on every push to main.

Live URL: https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
