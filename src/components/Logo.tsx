import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => (
  <svg
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1080 1080"
    className={className}
  >
    <path
      d="M540,84.89c-250.95,0-455.11,204.16-455.11,455.11s204.16,455.11,455.11,455.11h0c250.94,0,455.11-204.16,455.11-455.11S790.95,84.89,540,84.89M540,1026c-267.98,0-486-218.02-486-486S272.02,54,540,54s486,218.01,486,486-218.02,486-486,486"
      fill="currentColor"
    />
    <path
      d="M748.99,735h106.2l-158.25-79.91,11.38-5.93,126.75-62.2c27.19-13.26,40.39-34.77,40.39-65.76s-13.24-52.21-40.49-66.17l-134.88-66.54c-16.69-8.35-35.82-12.58-56.91-12.58s-40.08,4.22-56.48,12.55l-133.59,66.6c-11.51,5.87-21.28,14.82-28.96,26.56-6.81,10.4-10.62,22.2-11.32,35.06l-.22,4.12-.41.17v214.03h47.85l.06-218.08c1.22-9.28,6.57-16.18,15.49-19.96l127.8-63.91c24.81-11.91,52.5-12.75,80.41-.11l126.92,62.38c14.57,7.47,17.6,18.19,17.6,25.89s-3.1,18.5-17.87,24.93l-130.59,64.95c-22.11,10.98-48.46,10.9-70.49-.23l-1.52-.77-53.35,26.78,36.58,18.44h0s157.91,79.69,157.91,79.69Z"
      fill="currentColor"
    />
    <path
      d="M607.87,595.53l.8.4,18.28-8.97c27.17-13.26,40.38-34.76,40.38-65.75s-13.25-52.21-40.49-66.17l-19.29-9.51-52.68,26.34,47.83,23.51c14.47,7.42,17.5,18.15,17.5,25.84s-3.11,18.49-17.87,24.93l-126.44,62.87c-.93.48-1.88.9-2.82,1.34v50.48c6.47-2.01,12.76-4.52,18.83-7.59l45.59-22.37,70.39-35.33Z"
      fill="currentColor"
    />
    <path
      d="M399.19,610.75c-1.26-.54-2.53-1.08-3.79-1.67l-128.32-64.52c-12.74-6.56-15.4-16.31-15.4-23.35,0-11.48,5.46-19.87,15.79-24.24l127.8-63.91c23.62-11.34,49.91-12.6,76.44-1.79l53.19-26.52-32.94-16.25c-16.69-8.35-35.82-12.58-56.91-12.58s-40.08,4.22-56.48,12.55l-133.58,66.6c-11.52,5.87-21.28,14.82-28.96,26.57-7.61,11.63-11.47,24.94-11.47,39.57,0,31.21,13.2,52.71,40.34,65.74l133.62,66.27c6.7,3.35,13.6,6.07,20.68,8.16v-50.62Z"
      fill="currentColor"
    />
  </svg>
);

export default Logo;