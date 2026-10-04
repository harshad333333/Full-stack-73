// =============================================================================
// DATABASE: collegeDB
// COLLECTION: students
// SUBJECT: Full Stack Web Development / Database Lab - MongoDB Student Management
// =============================================================================

// -----------------------------------------------------------------------------
// STEP 1: Select / Switch to the 'collegeDB' database
// -----------------------------------------------------------------------------
use collegeDB;

// -----------------------------------------------------------------------------
// STEP 2: Drop existing 'students' collection (to start with a clean slate)
// -----------------------------------------------------------------------------
db.students.drop();

// -----------------------------------------------------------------------------
// REQUIREMENT 1: Insert student documents into the collection
// Schema: { rollNo, name, branch, year, marks, email }
// -----------------------------------------------------------------------------
db.students.insertMany([
  {
    rollNo: "23CM001",
    name: "Ravi Kumar",
    branch: "CSE-AIML",
    year: 3,
    marks: 85,
    email: "ravi@example.com"
  },
  {
    rollNo: "23CM002",
    name: "Priya Sharma",
    branch: "CSE-AIML",
    year: 3,
    marks: 92,
    email: "priya.sharma@example.com"
  },
  {
    rollNo: "23CS015",
    name: "Aditya Verma",
    branch: "CSE",
    year: 2,
    marks: 78,
    email: "aditya.v@example.com"
  },
  {
    rollNo: "23CS042",
    name: "Sneha Reddy",
    branch: "CSE",
    year: 3,
    marks: 68,
    email: "sneha.r@example.com"
  },
  {
    rollNo: "23EC010",
    name: "Rahul Nair",
    branch: "ECE",
    year: 2,
    marks: 74,
    email: "rahul.n@example.com"
  },
  {
    rollNo: "23IT005",
    name: "Ananya Iyer",
    branch: "IT",
    year: 3,
    marks: 89,
    email: "ananya.i@example.com"
  },
  {
    rollNo: "23CM018",
    name: "Vikram Singh",
    branch: "CSE-AIML",
    year: 4,
    marks: 81,
    email: "vikram.s@example.com"
  },
  {
    rollNo: "23DS007",
    name: "Meera Patel",
    branch: "CSE-DS",
    year: 3,
    marks: 95,
    email: "meera.p@example.com"
  }
]);

// -----------------------------------------------------------------------------
// REQUIREMENT 2: Display all students
// -----------------------------------------------------------------------------
print("\n--- [2] ALL STUDENTS ---");
db.students.find().pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 3: Display students belonging to a particular branch (CSE-AIML)
// -----------------------------------------------------------------------------
print("\n--- [3] STUDENTS IN CSE-AIML BRANCH ---");
db.students.find({ branch: "CSE-AIML" }).pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 4: Display students who scored more than 75 marks
// -----------------------------------------------------------------------------
print("\n--- [4] STUDENTS SCORING MORE THAN 75 MARKS ($gt: 75) ---");
db.students.find({ marks: { $gt: 75 } }).pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 5: Search for a student using rollNo
// -----------------------------------------------------------------------------
print("\n--- [5] SEARCH STUDENT BY ROLL NUMBER (23CM001) ---");
db.students.find({ rollNo: "23CM001" }).pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 6: Search students based on a specified condition (e.g., Year 3 & Marks >= 80)
// -----------------------------------------------------------------------------
print("\n--- [6] SEARCH STUDENTS: YEAR 3 AND MARKS >= 80 ---");
db.students.find({
  year: 3,
  marks: { $gte: 80 }
}).pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 7: Update the marks of a particular student
// -----------------------------------------------------------------------------
print("\n--- [7] UPDATE MARKS OF ROLL NO 23CM001 TO 96 ---");
db.students.updateOne(
  { rollNo: "23CM001" },
  { $set: { marks: 96 } }
);

// Verify the update
db.students.find({ rollNo: "23CM001" }).pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 8: Update another field such as email or branch
// -----------------------------------------------------------------------------
print("\n--- [8] UPDATE EMAIL AND BRANCH FOR ROLL NO 23CM001 ---");
db.students.updateOne(
  { rollNo: "23CM001" },
  {
    $set: {
      email: "ravi.kumar.aiml@college.edu",
      branch: "CSE-AIML (Advanced)"
    }
  }
);

// Verify the update
db.students.find({ rollNo: "23CM001" }).pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 9: Delete a student record using rollNo
// -----------------------------------------------------------------------------
print("\n--- [9] DELETE STUDENT RECORD WITH ROLL NO 23DS007 ---");
db.students.deleteOne({ rollNo: "23DS007" });

// Verify deletion
print("Remaining student count: " + db.students.countDocuments());

// -----------------------------------------------------------------------------
// REQUIREMENT 10: Display students in descending order of marks
// -----------------------------------------------------------------------------
print("\n--- [10] STUDENTS IN DESCENDING ORDER OF MARKS (marks: -1) ---");
db.students.find().sort({ marks: -1 }).pretty();

// -----------------------------------------------------------------------------
// REQUIREMENT 11: Create an index on rollNo
// -----------------------------------------------------------------------------
print("\n--- [11] CREATE UNIQUE ASCENDING INDEX ON rollNo ---");
db.students.createIndex({ rollNo: 1 }, { unique: true });

// List all indexes on collection to verify
print("Current Indexes on 'students':");
db.students.getIndexes();

// -----------------------------------------------------------------------------
// REQUIREMENT 12: Demonstrate why indexing is useful for searching student records
// -----------------------------------------------------------------------------
print("\n--- [12] DEMONSTRATION OF INDEX USEFULNESS ---");

// A. Query using an unindexed field (COLLSCAN - Collection Scan)
print("\nQuery A: Search by 'email' (Unindexed field):");
var collscanStats = db.students.find({ email: "ravi.kumar.aiml@college.edu" }).explain("executionStats");
print("Stage: " + collscanStats.executionStats.executionStages.stage);
print("Total Docs Examined: " + collscanStats.executionStats.totalDocsExamined);
print("Returned Docs: " + collscanStats.executionStats.nReturned);

// B. Query using the indexed field 'rollNo' (IXSCAN - Index Scan)
print("\nQuery B: Search by 'rollNo' (Indexed field):");
var ixscanStats = db.students.find({ rollNo: "23CM001" }).explain("executionStats");
print("Stage: " + ixscanStats.executionStats.executionStages.stage); // usually FETCH with inputStage IXSCAN
print("Total Docs Examined: " + ixscanStats.executionStats.totalDocsExamined);
print("Total Keys Examined: " + ixscanStats.executionStats.totalKeysExamined);
print("Returned Docs: " + ixscanStats.executionStats.nReturned);

/*
EXPLANATION OF INDEXING BENEFIT:
1. Without an Index (COLLSCAN):
   MongoDB must inspect every document in the collection from beginning to end
   to find matches. For N documents, execution time and disk I/O grow as O(N).
2. With an Index (IXSCAN):
   MongoDB uses a B-Tree structure ordered by rollNo. It traverses the tree in O(log N)
   steps and looks up the exact document pointer without scanning irrelevant records.
   In large production collections with millions of students, this cuts search times
   from seconds/minutes to milliseconds!
*/
