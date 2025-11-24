# DVA Group 30: Modeling Grant Decision Patterns Through Natural Language

## Description
The Grant Termination Dashboard is an interactive web interface designed to help users explore machine learing predictions, examine language patterns associated with grant termination, and assess potential model bias. The dashboard is organized into four separate panels, each supporting a specific component of our model. 
### Filters & Controls Panel
The top panel provides information on the entire dataset, including total test set size and termination rate. Users can filter grants by text search.
### Termination Word Cloud
This view highlights keywords most strongly associated with termination predictions.

- **Size** indicates how frequently a word appears in terminated grants.
- **Color** represents its directional risk: darker red indicates strong positive association with termination, while blue indicates protective terms linked to successful (non-terminated) grants.

Selecting any term highlights related grants and shows their termination probabilities, allowing users to inspect whether certain language correlates with higher risk.

### Bias Analysis & Fairness Metrics
This module visualizes how predicted termination outcomes vary across demographics (Race/Ethnicity, Gender, Mental Health, LGBTQ, Climate). It includes a table summarizing the overall impact of each category on termination risk.  

### Grant Details Table
This searchable, sortable table provides data per grant, including information such as termination status, recipient, etc.

## Installation
Before running the project, ensure you have the following installed:

- `Node.js` (v16 or higher)
- `npm`

Follow [this link](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for detailed instructions on how to install both dependencies on your operating system. 

## Execution
First, clone the repository to your machine: 
```bash
git clone https://github.com/kavyamajety2599/DVA6242Project30.git
```
Once the dependencies are installed, navigate to the `frontend` folder and run the server:
```bash
cd frontend/src
npm run dev
```
The output will be an HTTP local server address; copy and paste this into your web browser to view and interact with the Grant Termination Dashboard!

### Troubleshooting
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
