# DVA Group 30: Modeling Grant Decision Patterns Through Natural Language

A visual analytics dashboard for evaluating machine learning models predicting grant terminations. This project integrates model predictions, fairness metrics, and text analysis into an interactive React interface.

## Prerequisites
Before running the project, ensure you have the following installed:

- `Node.js` (v16 or higher)
- `npm`

## Running the Dashboard
First, clone the repository to your machine: 
```bash
git clone https://github.com/kavyamajety2599/DVA6242Project30.git
```
Once the dependencies are installed, navigate to the `frontend` folder and run the server:
```bash
cd frontend
npm run dev
```
The output will be an HTTP local server address; copy and paste this into your web browser to view the dashboard!

# Troubleshooting
If TypeScript complains about importing the JSON file (`Issue: "Cannot find module './grants.json'"`), ensure your tsconfig.json file (located in the `frontend` folder) includes the `resolveJsonModule` option:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true,
    ...
  }
}
```
