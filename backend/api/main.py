from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import psycopg2


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
origins = ["http://localhost:3000"]


conn = psycopg2.connect(
    host="react-app-db.xxxxxx.us-west-1.rds.amazonaws.com",
    database="appdb",
    user="admin",
    password="supersecurepassword"
)

projects = []
expenses = []
    
class Project(BaseModel):
    name: str

class Expense(BaseModel):
    project_name: str
    description: str
    amount: int
    vendor: str
    date: str

##################################################
#METHODS
##################################################
#POST
##################################################
@app.post("/projects")
def create_project(project: Project):

    new_project = {
        #"id": len(projects) + 1,
        "name": project.name,
        "expenses": []
    }

    projects.append(new_project)

    return new_project


@app.post("/expenses")
def add_expense(expense: Expense):

    new_expense = {
        "id": len(expenses) + 1,
        "project_name": expense.project_name,
        "description": expense.description,
        "amount": expense.amount,
        "vendor": expense.vendor,
        "date": expense.date
    }

    expenses.append(new_expense)

    # Link expense to project
    for project in projects:
        if project["name"] == expense.project_name:
            project["expenses"].append(new_expense)
            break

    return new_expense

@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, expense: Expense):

    for e in expenses:
        if e["id"] == expense_id:
            e["project_name"] = expense.project_name
            e["description"] = expense.description
            e["amount"] = expense.amount
            e["vendor"] = expense.vendor
            e["date"] = expense.date

            # Update project link
            for project in projects:
                if project["name"] == expense.project_name:
                    # Remove from old project
                    for p in projects:
                        if p["name"] == e["project_name"]:
                            p["expenses"] = [ex for ex in p["expenses"] if ex["id"] != expense_id]
                            break
                    # Add to new project
                    project["expenses"].append(e)
                    break

            return e

    return {"error": "Expense not found"}














###################################
#GET
###################################
@app.get("/expenses")
def get_expenses():
    return expenses
@app.get("/projects")
def get_projects():
    return projects
