# CollegeDB - Student Information Management System

**Course / Lab:** Full Stack Web Development / Database Management Systems (MongoDB Lab)  
**Database:** `collegeDB`  
**Collection:** `students`  

---

## 📋 Document Schema
Each student document in the `students` collection adheres to the following structure:

```json
{
  "rollNo": "23CM001",
  "name": "Ravi Kumar",
  "branch": "CSE-AIML",
  "year": 3,
  "marks": 85,
  "email": "ravi@example.com"
}
```

---

## 🚀 Quick Start & How to Run

### Option 1: Run the Interactive Web Studio
A modern web application with a live query preview, 12-task runner, and B-Tree indexing benchmark:
1. Open [`index.html`](file:///c:/Users/HARSHA/OneDrive/Desktop/fs/assignment/index.html) directly in any web browser (Chrome, Edge, Firefox).
2. Or access it via the local development server at: **`http://localhost:5175/index.html`**

### Option 2: Run via Node.js CLI Runner
You can run all 12 database operations sequentially in your terminal:
```bash
node assignment/studentManager.js
```
*Outputs formatted ASCII tables for each query step and demonstrates COLLSCAN vs IXSCAN execution stats.*

### Option 3: Run directly in MongoDB Shell (`mongosh`) or MongoDB Compass
Execute the script [`collegeDB.mongodb.js`](file:///c:/Users/HARSHA/OneDrive/Desktop/fs/assignment/collegeDB.mongodb.js):
```bash
mongosh "mongodb://localhost:27017" collegeDB.mongodb.js
```

---

## 📝 Detailed MongoDB Operations (All 12 Requirements)

### 1. Insert Documents into the Collection
```javascript
use collegeDB;

db.students.insertMany([
  { rollNo: "23CM001", name: "Ravi Kumar", branch: "CSE-AIML", year: 3, marks: 85, email: "ravi@example.com" },
  { rollNo: "23CM002", name: "Priya Sharma", branch: "CSE-AIML", year: 3, marks: 92, email: "priya.sharma@example.com" },
  { rollNo: "23CS015", name: "Aditya Verma", branch: "CSE", year: 2, marks: 78, email: "aditya.v@example.com" },
  { rollNo: "23CS042", name: "Sneha Reddy", branch: "CSE", year: 3, marks: 68, email: "sneha.r@example.com" },
  { rollNo: "23EC010", name: "Rahul Nair", branch: "ECE", year: 2, marks: 74, email: "rahul.n@example.com" },
  { rollNo: "23IT005", name: "Ananya Iyer", branch: "IT", year: 3, marks: 89, email: "ananya.i@example.com" },
  { rollNo: "23CM018", name: "Vikram Singh", branch: "CSE-AIML", year: 4, marks: 81, email: "vikram.s@example.com" },
  { rollNo: "23DS007", name: "Meera Patel", branch: "CSE-DS", year: 3, marks: 95, email: "meera.p@example.com" }
]);
```

### 2. Display All Students
```javascript
db.students.find().pretty();
```

### 3. Display Students Belonging to a Particular Branch (CSE-AIML)
```javascript
db.students.find({ branch: "CSE-AIML" }).pretty();
```

### 4. Display Students Who Scored More Than 75 Marks
```javascript
db.students.find({ marks: { $gt: 75 } }).pretty();
```

### 5. Search for a Student Using `rollNo`
```javascript
db.students.find({ rollNo: "23CM001" }).pretty();
```

### 6. Search Students Based on Specified Condition (Year 3 AND Marks >= 80)
```javascript
db.students.find({
  year: 3,
  marks: { $gte: 80 }
}).pretty();
```

### 7. Update the Marks of a Particular Student
```javascript
db.students.updateOne(
  { rollNo: "23CM001" },
  { $set: { marks: 96 } }
);
```

### 8. Update Another Field Such as Email or Branch
```javascript
db.students.updateOne(
  { rollNo: "23CM001" },
  {
    $set: {
      email: "ravi.kumar.aiml@college.edu",
      branch: "CSE-AIML (Advanced)"
    }
  }
);
```

### 9. Delete a Student Record Using `rollNo`
```javascript
db.students.deleteOne({ rollNo: "23DS007" });
```

### 10. Display Students in Descending Order of Marks
```javascript
db.students.find().sort({ marks: -1 }).pretty();
```

### 11. Create an Index on `rollNo`
```javascript
db.students.createIndex({ rollNo: 1 }, { unique: true });
```
To verify the index:
```javascript
db.students.getIndexes();
```

---

## ⚡ Requirement 12: Why Indexing is Useful for Searching Records

### Concept & Mechanics
1. **Without an Index (`COLLSCAN` - Collection Scan):**
   - MongoDB has no ordering information, so it reads every document off disk/memory from top to bottom.
   - For a collection of $N$ documents, the worst-case and average-case time complexity is **$O(N)$**.
   - If a college has 50,000 students, an unindexed search checks all 50,000 documents.

2. **With an Index on `rollNo` (`IXSCAN` - Index Scan):**
   - MongoDB stores an ordered **B-Tree** structure mapping each `rollNo` directly to its physical document record pointer (`RecordId`).
   - Searching the B-Tree takes **$O(\log N)$** time (typically ~3 to 4 node pointer hops).
   - Once the key is located, MongoDB performs a direct `FETCH` of only that exact document.

### Verification using `explain("executionStats")`

#### A. Query on Unindexed Field (email) - COLLSCAN:
```javascript
db.students.find({ email: "ravi.kumar.aiml@college.edu" }).explain("executionStats");
```
**Key Metrics in ExecutionStats:**
- `stage`: `"COLLSCAN"`
- `totalDocsExamined`: Equal to the total number of documents in the collection
- `totalKeysExamined`: `0`
- `nReturned`: `1`

#### B. Query on Indexed Field (rollNo) - IXSCAN:
```javascript
db.students.find({ rollNo: "23CM001" }).explain("executionStats");
```
**Key Metrics in ExecutionStats:**
- `stage`: `"FETCH"` with `inputStage.stage: "IXSCAN"`
- `indexName`: `"rollNo_1"`
- `totalKeysExamined`: `1`
- `totalDocsExamined`: `1`
- `nReturned`: `1`

| Comparison Metric | Without Index (`COLLSCAN`) | With Index on `rollNo` (`IXSCAN`) |
| :--- | :--- | :--- |
| **Search Stage** | `COLLSCAN` | `IXSCAN` &rarr; `FETCH` |
| **Time Complexity** | $O(N)$ (Linear scan) | $O(\log N)$ (B-Tree traversal) |
| **Docs Examined (at 50,000 records)** | **50,000 docs** | **1 doc** |
| **Keys Examined** | 0 keys | 1 key |
| **Disk / CPU I/O** | High (Reads entire table) | Negligible (Direct memory lookup) |
| **Uniqueness Enforcement** | No guarantee | Enforces unique student roll numbers |

---

## 📁 Repository Structure
```
assignment/
├── index.html            # Web application UI (Dashboard, Filters, Benchmark)
├── style.css             # Vanilla CSS design system (Dark mode & Glassmorphism)
├── app.js                # Frontend Controller, CRUD engine & simulated B-Tree visualizer
├── collegeDB.mongodb.js  # Official MongoDB Shell script with all 12 queries
├── studentManager.js     # Standalone Node.js CLI runner
└── README.md             # Lab manual & documentation
```
