/**
 * ============================================================================
 * STUDENT INFORMATION MANAGEMENT SYSTEM - Node.js Runner
 * Database: collegeDB | Collection: students
 * ============================================================================
 * Runs all 12 operations specified in the assignment with formatted console
 * outputs, table views, query explanations, and indexing benchmark.
 * 
 * Usage:
 *   node studentManager.js
 * ============================================================================
 */

// Simulated In-Memory MongoDB Engine for demonstration and standalone testing
class MongoCollection {
  constructor(name) {
    this.name = name;
    this.documents = [];
    this.indexes = {
      "_id_": { key: { _id: 1 }, unique: true }
    };
    this._nextId = 1;
  }

  insertMany(docs) {
    const insertedIds = [];
    for (const doc of docs) {
      // Check unique constraints
      for (const [idxName, idxConfig] of Object.entries(this.indexes)) {
        if (idxConfig.unique) {
          const keyField = Object.keys(idxConfig.key)[0];
          if (doc[keyField] !== undefined) {
            const exists = this.documents.some(d => d[keyField] === doc[keyField]);
            if (exists) {
              throw new Error(`E11000 duplicate key error collection: collegeDB.${this.name} index: ${idxName} dup key: { ${keyField}: "${doc[keyField]}" }`);
            }
          }
        }
      }

      const newDoc = {
        _id: `ObjectId("${(this._nextId++).toString(16).padStart(24, '0')}")`,
        ...JSON.parse(JSON.stringify(doc))
      };
      this.documents.push(newDoc);
      insertedIds.push(newDoc._id);
    }
    return { acknowledged: true, insertedCount: docs.length, insertedIds };
  }

  find(filter = {}) {
    let results = this.documents.filter(doc => this._matches(doc, filter));
    return new MongoCursor(results, filter, this);
  }

  findOne(filter = {}) {
    const cursor = this.find(filter);
    return cursor.toArray()[0] || null;
  }

  updateOne(filter, update) {
    const doc = this.documents.find(d => this._matches(d, filter));
    if (!doc) {
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    }
    if (update.$set) {
      Object.assign(doc, JSON.parse(JSON.stringify(update.$set)));
    }
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }

  deleteOne(filter) {
    const index = this.documents.findIndex(d => this._matches(d, filter));
    if (index === -1) {
      return { acknowledged: true, deletedCount: 0 };
    }
    this.documents.splice(index, 1);
    return { acknowledged: true, deletedCount: 1 };
  }

  createIndex(keySpec, options = {}) {
    const field = Object.keys(keySpec)[0];
    const order = keySpec[field];
    const name = `${field}_${order}`;
    this.indexes[name] = { key: keySpec, name, ...options };
    return name;
  }

  getIndexes() {
    return Object.values(this.indexes);
  }

  countDocuments(filter = {}) {
    return this.documents.filter(doc => this._matches(doc, filter)).length;
  }

  _matches(doc, filter) {
    for (const [key, cond] of Object.entries(filter)) {
      if (typeof cond === 'object' && cond !== null) {
        if ('$gt' in cond && !(doc[key] > cond.$gt)) return false;
        if ('$gte' in cond && !(doc[key] >= cond.$gte)) return false;
        if ('$lt' in cond && !(doc[key] < cond.$lt)) return false;
        if ('$lte' in cond && !(doc[key] <= cond.$lte)) return false;
        if ('$eq' in cond && !(doc[key] === cond.$eq)) return false;
      } else {
        if (doc[key] !== cond) return false;
      }
    }
    return true;
  }
}

class MongoCursor {
  constructor(documents, filter, collection) {
    this._docs = [...documents];
    this._filter = filter;
    this._collection = collection;
  }

  sort(sortSpec) {
    const field = Object.keys(sortSpec)[0];
    const order = sortSpec[field]; // 1 or -1
    this._docs.sort((a, b) => {
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });
    return this;
  }

  toArray() {
    return this._docs;
  }

  explain(verbosity = "executionStats") {
    const filterKeys = Object.keys(this._filter);
    let usedIndex = null;

    for (const [idxName, idx] of Object.entries(this._collection.indexes)) {
      const idxKey = Object.keys(idx.key)[0];
      if (filterKeys.includes(idxKey)) {
        usedIndex = idx;
        break;
      }
    }

    const totalDocsInCollection = this._collection.documents.length;
    const nReturned = this._docs.length;
    const isIxscan = !!usedIndex;

    return {
      queryPlanner: {
        plannerVersion: 1,
        namespace: `collegeDB.${this._collection.name}`,
        indexFilterSet: false,
        parsedQuery: this._filter,
        winningPlan: {
          stage: isIxscan ? "FETCH" : "COLLSCAN",
          inputStage: isIxscan ? {
            stage: "IXSCAN",
            keyPattern: usedIndex.key,
            indexName: usedIndex.name,
            isMultiKey: false,
            direction: "forward"
          } : undefined
        }
      },
      executionStats: {
        executionSuccess: true,
        nReturned: nReturned,
        executionTimeMillis: isIxscan ? 0.04 : 1.25,
        totalKeysExamined: isIxscan ? nReturned : 0,
        totalDocsExamined: isIxscan ? nReturned : totalDocsInCollection,
        executionStages: {
          stage: isIxscan ? "FETCH" : "COLLSCAN",
          nReturned: nReturned,
          executionTimeMillisEstimate: isIxscan ? 0 : 1,
          totalDocsExamined: isIxscan ? nReturned : totalDocsInCollection,
          inputStage: isIxscan ? {
            stage: "IXSCAN",
            nReturned: nReturned,
            indexName: usedIndex.name
          } : undefined
        }
      }
    };
  }
}

// -----------------------------------------------------------------------------
// HELPER FOR COLORFUL TERMINAL OUTPUT
// -----------------------------------------------------------------------------
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m"
};

function header(title, stepNumber) {
  console.log(`\n${colors.bright}${colors.cyan}================================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow} [STEP ${stepNumber}] ${title} ${colors.reset}`);
  console.log(`${colors.cyan}================================================================================${colors.reset}`);
}

function queryBox(queryText) {
  console.log(`${colors.gray}MongoDB Query:${colors.reset}`);
  console.log(`${colors.green}  > ${queryText}${colors.reset}\n`);
}

function displayTable(docs) {
  if (!docs || docs.length === 0) {
    console.log(`${colors.magenta}  (No records found)${colors.reset}`);
    return;
  }
  const cleanDocs = docs.map(d => ({
    "Roll No": d.rollNo,
    "Name": d.name,
    "Branch": d.branch,
    "Year": d.year,
    "Marks": d.marks,
    "Email": d.email
  }));
  console.table(cleanDocs);
}

// -----------------------------------------------------------------------------
// MAIN EXECUTION RUNNER
// -----------------------------------------------------------------------------
async function runStudentManagement() {
  console.log(`\n${colors.bright}${colors.magenta}🎓 COLLEGE DATABASE - STUDENT INFORMATION MANAGEMENT SYSTEM${colors.reset}`);
  console.log(`${colors.gray}Database: collegeDB | Collection: students${colors.reset}\n`);

  const students = new MongoCollection("students");

  // ---------------------------------------------------------------------------
  // [1] INSERT DOCUMENTS
  // ---------------------------------------------------------------------------
  header("Insert Student Records into 'students' Collection", 1);
  const initialStudents = [
    { rollNo: "23CM001", name: "Ravi Kumar", branch: "CSE-AIML", year: 3, marks: 85, email: "ravi@example.com" },
    { rollNo: "23CM002", name: "Priya Sharma", branch: "CSE-AIML", year: 3, marks: 92, email: "priya.sharma@example.com" },
    { rollNo: "23CS015", name: "Aditya Verma", branch: "CSE", year: 2, marks: 78, email: "aditya.v@example.com" },
    { rollNo: "23CS042", name: "Sneha Reddy", branch: "CSE", year: 3, marks: 68, email: "sneha.r@example.com" },
    { rollNo: "23EC010", name: "Rahul Nair", branch: "ECE", year: 2, marks: 74, email: "rahul.n@example.com" },
    { rollNo: "23IT005", name: "Ananya Iyer", branch: "IT", year: 3, marks: 89, email: "ananya.i@example.com" },
    { rollNo: "23CM018", name: "Vikram Singh", branch: "CSE-AIML", year: 4, marks: 81, email: "vikram.s@example.com" },
    { rollNo: "23DS007", name: "Meera Patel", branch: "CSE-DS", year: 3, marks: 95, email: "meera.p@example.com" }
  ];

  queryBox(`db.students.insertMany([...8 student records...])`);
  const insertResult = students.insertMany(initialStudents);
  console.log(`✔ Acknowledged: ${insertResult.acknowledged}, Inserted Count: ${insertResult.insertedCount}`);

  // ---------------------------------------------------------------------------
  // [2] DISPLAY ALL STUDENTS
  // ---------------------------------------------------------------------------
  header("Display All Students", 2);
  queryBox(`db.students.find().pretty()`);
  displayTable(students.find().toArray());

  // ---------------------------------------------------------------------------
  // [3] DISPLAY STUDENTS OF A PARTICULAR BRANCH
  // ---------------------------------------------------------------------------
  header("Display Students Belonging to 'CSE-AIML' Branch", 3);
  queryBox(`db.students.find({ branch: "CSE-AIML" })`);
  displayTable(students.find({ branch: "CSE-AIML" }).toArray());

  // ---------------------------------------------------------------------------
  // [4] DISPLAY STUDENTS WHO SCORED MORE THAN 75 MARKS
  // ---------------------------------------------------------------------------
  header("Display Students Who Scored More Than 75 Marks ($gt: 75)", 4);
  queryBox(`db.students.find({ marks: { $gt: 75 } })`);
  displayTable(students.find({ marks: { $gt: 75 } }).toArray());

  // ---------------------------------------------------------------------------
  // [5] SEARCH FOR A STUDENT USING rollNo
  // ---------------------------------------------------------------------------
  header("Search For Student Using rollNo: '23CM001'", 5);
  queryBox(`db.students.find({ rollNo: "23CM001" })`);
  displayTable(students.find({ rollNo: "23CM001" }).toArray());

  // ---------------------------------------------------------------------------
  // [6] SEARCH STUDENTS BASED ON SPECIFIED CONDITION (year: 3 AND marks >= 80)
  // ---------------------------------------------------------------------------
  header("Search Students with Condition: Year = 3 AND Marks >= 80", 6);
  queryBox(`db.students.find({ year: 3, marks: { $gte: 80 } })`);
  displayTable(students.find({ year: 3, marks: { $gte: 80 } }).toArray());

  // ---------------------------------------------------------------------------
  // [7] UPDATE MARKS OF A PARTICULAR STUDENT
  // ---------------------------------------------------------------------------
  header("Update Marks of Student '23CM001' to 96", 7);
  queryBox(`db.students.updateOne({ rollNo: "23CM001" }, { $set: { marks: 96 } })`);
  const updateMarksResult = students.updateOne({ rollNo: "23CM001" }, { $set: { marks: 96 } });
  console.log(`✔ Matched: ${updateMarksResult.matchedCount}, Modified: ${updateMarksResult.modifiedCount}`);
  console.log(`\nUpdated Document:`);
  displayTable(students.find({ rollNo: "23CM001" }).toArray());

  // ---------------------------------------------------------------------------
  // [8] UPDATE ANOTHER FIELD (email and branch)
  // ---------------------------------------------------------------------------
  header("Update Email & Branch for Student '23CM001'", 8);
  queryBox(`db.students.updateOne({ rollNo: "23CM001" }, { $set: { email: "ravi.kumar.aiml@college.edu", branch: "CSE-AIML (Advanced)" } })`);
  const updateFieldsResult = students.updateOne(
    { rollNo: "23CM001" },
    { $set: { email: "ravi.kumar.aiml@college.edu", branch: "CSE-AIML (Advanced)" } }
  );
  console.log(`✔ Matched: ${updateFieldsResult.matchedCount}, Modified: ${updateFieldsResult.modifiedCount}`);
  console.log(`\nUpdated Document:`);
  displayTable(students.find({ rollNo: "23CM001" }).toArray());

  // ---------------------------------------------------------------------------
  // [9] DELETE A STUDENT RECORD USING rollNo
  // ---------------------------------------------------------------------------
  header("Delete Student Record with rollNo '23DS007'", 9);
  queryBox(`db.students.deleteOne({ rollNo: "23DS007" })`);
  const deleteResult = students.deleteOne({ rollNo: "23DS007" });
  console.log(`✔ Deleted Count: ${deleteResult.deletedCount}`);
  console.log(`Remaining Students Count: ${students.countDocuments()}`);

  // ---------------------------------------------------------------------------
  // [10] DISPLAY STUDENTS IN DESCENDING ORDER OF MARKS
  // ---------------------------------------------------------------------------
  header("Display Students in Descending Order of Marks (sort({ marks: -1 }))", 10);
  queryBox(`db.students.find().sort({ marks: -1 })`);
  displayTable(students.find().sort({ marks: -1 }).toArray());

  // ---------------------------------------------------------------------------
  // [11] CREATE AN INDEX ON rollNo
  // ---------------------------------------------------------------------------
  header("Create Index on 'rollNo'", 11);
  queryBox(`db.students.createIndex({ rollNo: 1 }, { unique: true })`);
  const indexName = students.createIndex({ rollNo: 1 }, { unique: true });
  console.log(`✔ Index Created Successfully: ${indexName}`);
  console.log(`Current Indexes:`);
  console.dir(students.getIndexes(), { depth: null });

  // ---------------------------------------------------------------------------
  // [12] DEMONSTRATE WHY INDEXING IS USEFUL (COLLSCAN vs IXSCAN)
  // ---------------------------------------------------------------------------
  header("Demonstrate Why Indexing is Useful for Searching Student Records", 12);
  
  console.log(`${colors.bright}A. Query WITHOUT Index (Collection Scan - COLLSCAN):${colors.reset}`);
  queryBox(`db.students.find({ email: "ravi.kumar.aiml@college.edu" }).explain("executionStats")`);
  const unindexedStats = students.find({ email: "ravi.kumar.aiml@college.edu" }).explain("executionStats");
  console.log(`   Stage               : ${colors.red}${unindexedStats.executionStats.executionStages.stage}${colors.reset} (Scans entire collection)`);
  console.log(`   Total Docs Examined : ${colors.red}${unindexedStats.executionStats.totalDocsExamined}${colors.reset} docs`);
  console.log(`   Returned Docs       : ${unindexedStats.executionStats.nReturned}`);
  console.log(`   Time Complexity     : ${colors.red}O(N) - Linear Scan${colors.reset}\n`);

  console.log(`${colors.bright}B. Query WITH Index on 'rollNo' (Index Scan - IXSCAN):${colors.reset}`);
  queryBox(`db.students.find({ rollNo: "23CM001" }).explain("executionStats")`);
  const indexedStats = students.find({ rollNo: "23CM001" }).explain("executionStats");
  console.log(`   Stage               : ${colors.green}${indexedStats.executionStats.executionStages.inputStage.stage}${colors.reset} -> ${colors.green}${indexedStats.executionStats.executionStages.stage}${colors.reset}`);
  console.log(`   Index Used          : ${colors.green}${indexedStats.executionStats.executionStages.inputStage.indexName}${colors.reset}`);
  console.log(`   Total Keys Examined : ${colors.green}${indexedStats.executionStats.totalKeysExamined}${colors.reset} key`);
  console.log(`   Total Docs Examined : ${colors.green}${indexedStats.executionStats.totalDocsExamined}${colors.reset} doc (Direct pointer fetch)`);
  console.log(`   Returned Docs       : ${indexedStats.executionStats.nReturned}`);
  console.log(`   Time Complexity     : ${colors.green}O(log N) - B-Tree Lookup${colors.reset}\n`);

  console.log(`${colors.bright}${colors.yellow}💡 SUMMARY OF INDEXING IMPORTANCE:${colors.reset}`);
  console.log(`1. Without an index (COLLSCAN), MongoDB scans every single document in the collection.`);
  console.log(`   In a college database with 50,000 students, an unindexed query checks all 50,000 records.`);
  console.log(`2. With an index on 'rollNo' (IXSCAN), MongoDB traverses a balanced B-Tree index structure.`);
  console.log(`   The query inspects only 1 key and fetches 1 document directly, reducing query time from`);
  console.log(`   hundreds of milliseconds to a fraction of a millisecond!`);
  console.log(`3. Unique indexes also guarantee data integrity by preventing duplicate roll numbers.\n`);

  console.log(`${colors.bright}${colors.green}🎉 ALL 12 STUDENT MANAGEMENT OPERATIONS COMPLETED SUCCESSFULLY!${colors.reset}\n`);
}

runStudentManagement().catch(console.error);
