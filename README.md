# DVA Group 30

DVA Grant Termination Dashboard
A visual analytics dashboard for evaluating machine learning models predicting grant terminations. This project integrates model predictions, fairness metrics, and text analysis into an interactive React interface.

Prerequisites
Before running the project, ensure you have the following installed:

Node.js (v16 or higher) & npm

Running the Application:
Once the dependencies are installed, start the development server:
-> npm run dev

Troubleshooting:
Issue: "Cannot find module './grants.json'" If TypeScript complains about importing the JSON file, ensure your tsconfig.json includes the resolveJsonModule option:

JSON

{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true,
    ...
  }
}