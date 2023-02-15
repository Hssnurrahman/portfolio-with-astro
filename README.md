# Portfolio Website

This is a portfolio website built using Astro.js and Tailwind CSS, a utility-first CSS framework that makes it easy to create responsive, customizable user interfaces. The website is designed to showcase my work and provide information about my skills.

## Requirements

Node = 18.14.0

yarn / npm but yarn is preferred

## Installation

To install and run the website locally, follow these steps:

1. Clone the repository to your local machine using Git:

`git clone https://github.com/Hssnurrahman/portfolio-with-astro`

2. Navigate to the project directory and install the dependencies:

   `cd portfolio-with-astro`  
   `yarn install`

3. Start the development server:

   `yarn dev`

4. Open your web browser and navigate to `http://localhost:3000` to view the website.

## Structure

All work in Astro.js must be done in the "src" directory. Below is the list of directories that you have to interact with:

- `src/components`: This folder contains reusable components that can be used across multiple pages of the site.

- `src/pages`: This folder contains the pages of the site, which are written in Astro.js.

- `src/styles`: This folder contains the stylesheets for the site, which can be written in plain CSS or preprocessed with a CSS preprocessor like Sass or Less.

- `src/utils`: This folder contains helper functions that can be used across different files.

- `src/data`: This folder contains all the data to be displayed on the site.

- `src/icons`: This folder contains icons that will be displayed on portfolio.

## Create Portfolio in 30 Minutes:

In this section, I will tell you which file you have to change to create your own portfolio similar to this in less than one hour:

- `src/data`: In this folder, you have to change all your data, for example, by adding your own skills, etc. You can use icons; the link is in references.

- `src/data`: In all icon files inside the data folder, you have to add icons; the link is in the references. It is array of following properties:

  - `icon`: It consists of icon name taken from astro-icon package. You can copy name of your desired icon and paste here.

  - `className`: It is used to give color to icon.

  - `ariaLabel`: It is used for accessibility purposes.

  - `label`: It is label shown below each icon.

  Above is valid for all except LandingIcons file. In this file, You have to pass href instead of label.

- `src/components/Header.astro`: In this file, you only have to change your name instead of mine.

- `src/styles/Icon.scss`: If you add or remove any skills, then you have to add styles for that icon too. It's very simple; all you have to do is add icon name and color in icons array. I am giving you sample code for that below:

  `"react" #61dafb`

## Change Favicon

If you want to change favicon, then you have to follow below steps:

- You can download any icon in png format from [FlatIcon](www.flaticon.com) for free.

- You have to open this website [Favicon Generator](https://favicon.io/favicon-converter), you can convert png to ico on this website.

- Download ico files and extract it.

- Place ico files in public folder inside project directory.

## Deployment

To deploy the website to a production server or content delivery network (CDN), follow these steps:

1. Build the website using Astro.js:

   `yarn build`

2. You can use vercel / Netlify to deploy your site.

## Tools

- AstroJS
- Tailwindcss
- sass
- astro-icon

## References

[Astro.js](https://astro.build) Official Site

[A Practical Guide To Building Faster Websites](https://app.daily.dev/posts/6NVfwGnI2) with Astro.js

[How to use icons in Astro.js](https://icones.js.org/)
