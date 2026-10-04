/**
 * ============================================================================
 * CollegeDB Studio - Application Logic
 * Database: collegeDB | Collection: students
 * ============================================================================
 */

// Initial Seed Data
const INITIAL_STUDENTS = [
  { rollNo: "23CM001", name: "Ravi Kumar", branch: "CSE-AIML", year: 3, marks: 85, email: "ravi@example.com" },
  { rollNo: "23CM002", name: "Priya Sharma", branch: "CSE-AIML", year: 3, marks: 92, email: "priya.sharma@example.com" },
  { rollNo: "23CS015", name: "Aditya Verma", branch: "CSE", year: 2, marks: 78, email: "aditya.v@example.com" },
  { rollNo: "23CS042", name: "Sneha Reddy", branch: "CSE", year: 3, marks: 68, email: "sneha.r@example.com" },
  { rollNo: "23EC010", name: "Rahul Nair", branch: "ECE", year: 2, marks: 74, email: "rahul.n@example.com" },
  { rollNo: "23IT005", name: "Ananya Iyer", branch: "IT", year: 3, marks: 89, email: "ananya.i@example.com" },
  { rollNo: "23CM018", name: "Vikram Singh", branch: "CSE-AIML", year: 4, marks: 81, email: "vikram.s@example.com" },
  { rollNo: "23DS007", name: "Meera Patel", branch: "CSE-DS", year: 3, marks: 95, email: "meera.p@example.com" }
];

// State
let students = JSON.parse(localStorage.getItem("collegeDB_students")) || [...INITIAL_STUDENTS];
let isIndexActive = true;
let activeTab = "directory";
let viewMode = "table"; // "table" | "cards"
let currentEditingRoll = null;

// Lab Tasks Definitions
const LAB_TASKS = {
  1: {
    badge: "Requirement 1",
    title: "Insert Student Records into 'students' Collection",
    desc: "Inserts at least 8 student documents with rollNo, name, branch, year, marks, and email.",
    code: `// Insert multiple student documents into the collection\ndb.students.insertMany([\n  {\n    rollNo: "23CM001",\n    name: "Ravi Kumar",\n    branch: "CSE-AIML",\n    year: 3,\n    marks: 85,\n    email: "ravi@example.com"\n  },\n  {\n    rollNo: "23CM002",\n    name: "Priya Sharma",\n    branch: "CSE-AIML",\n    year: 3,\n    marks: 92,\n    email: "priya.sharma@example.com"\n  },\n  {\n    rollNo: "23CS015",\n    name: "Aditya Verma",\n    branch: "CSE",\n    year: 2,\n    marks: 78,\n    email: "aditya.v@example.com"\n  },\n  {\n    rollNo: "23DS007",\n    name: "Meera Patel",\n    branch: "CSE-DS",\n    year: 3,\n    marks: 95,\n    email: "meera.p@example.com"\n  }\n]);`,
    execute: () => {
      students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
      saveState();
      return {
        acknowledged: true,
        insertedCount: students.length,
        status: "Successfully loaded initial 8 student documents into collegeDB.students"
      };
    }
  },
  2: {
    badge: "Requirement 2",
    title: "Display All Students",
    desc: "Fetches and displays all student documents currently present in the collection.",
    code: `// Display all students with pretty formatting\ndb.students.find().pretty();`,
    execute: () => {
      return students;
    }
  },
  3: {
    badge: "Requirement 3",
    title: "Display Students Belonging to a Particular Branch",
    desc: "Queries students specifically enrolled in the 'CSE-AIML' branch.",
    code: `// Find students where branch is exactly "CSE-AIML"\ndb.students.find({\n  branch: "CSE-AIML"\n}).pretty();`,
    execute: () => {
      return students.filter(s => s.branch === "CSE-AIML");
    }
  },
  4: {
    badge: "Requirement 4",
    title: "Display Students Who Scored More Than 75 Marks",
    desc: "Uses the MongoDB comparison query operator $gt to find students scoring > 75 marks.",
    code: `// Find students with marks strictly greater than 75\ndb.students.find({\n  marks: { $gt: 75 }\n}).pretty();`,
    execute: () => {
      return students.filter(s => s.marks > 75);
    }
  },
  5: {
    badge: "Requirement 5",
    title: "Search for a Student Using rollNo",
    desc: "Looks up a single student by their unique roll number: '23CM001'.",
    code: `// Search for student record by unique rollNo\ndb.students.find({\n  rollNo: "23CM001"\n}).pretty();`,
    execute: () => {
      return students.filter(s => s.rollNo.toUpperCase() === "23CM001");
    }
  },
  6: {
    badge: "Requirement 6",
    title: "Search Students Based on Specified Condition (Year 3 & Marks >= 80)",
    desc: "Demonstrates compound filtering with multiple conditions: year equals 3 AND marks >= 80.",
    code: `// Find 3rd year students who scored 80 or above ($gte)\ndb.students.find({\n  year: 3,\n  marks: { $gte: 80 }\n}).pretty();`,
    execute: () => {
      return students.filter(s => s.year === 3 && s.marks >= 80);
    }
  },
  7: {
    badge: "Requirement 7",
    title: "Update the Marks of a Particular Student",
    desc: "Uses updateOne with the $set operator to change marks of student '23CM001' to 96.",
    code: `// Update marks of rollNo "23CM001" to 96\ndb.students.updateOne(\n  { rollNo: "23CM001" },\n  { $set: { marks: 96 } }\n);`,
    execute: () => {
      const target = students.find(s => s.rollNo === "23CM001");
      if (target) {
        target.marks = 96;
        saveState();
        return {
          acknowledged: true,
          matchedCount: 1,
          modifiedCount: 1,
          updatedStudent: target
        };
      }
      return { matchedCount: 0, modifiedCount: 0, message: "Student 23CM001 not found" };
    }
  },
  8: {
    badge: "Requirement 8",
    title: "Update Another Field Such as Email or Branch",
    desc: "Uses updateOne with $set to update both email and branch fields for student '23CM001'.",
    code: `// Update email and branch for student "23CM001"\ndb.students.updateOne(\n  { rollNo: "23CM001" },\n  {\n    $set: {\n      email: "ravi.kumar.aiml@college.edu",\n      branch: "CSE-AIML (Advanced)"\n    }\n  }\n);`,
    execute: () => {
      const target = students.find(s => s.rollNo === "23CM001");
      if (target) {
        target.email = "ravi.kumar.aiml@college.edu";
        target.branch = "CSE-AIML (Advanced)";
        saveState();
        return {
          acknowledged: true,
          matchedCount: 1,
          modifiedCount: 1,
          updatedStudent: target
        };
      }
      return { matchedCount: 0, modifiedCount: 0 };
    }
  },
  9: {
    badge: "Requirement 9",
    title: "Delete a Student Record Using rollNo",
    desc: "Deletes student record with rollNo '23DS007' using deleteOne.",
    code: `// Delete student with rollNo "23DS007"\ndb.students.deleteOne({\n  rollNo: "23DS007"\n});`,
    execute: () => {
      const beforeCount = students.length;
      students = students.filter(s => s.rollNo !== "23DS007");
      saveState();
      return {
        acknowledged: true,
        deletedCount: beforeCount - students.length,
        remainingTotal: students.length
      };
    }
  },
  10: {
    badge: "Requirement 10",
    title: "Display Students in Descending Order of Marks",
    desc: "Uses sort({ marks: -1 }) to rank students from highest to lowest score.",
    code: `// Display all students sorted in descending order of marks (-1)\ndb.students.find().sort({ marks: -1 }).pretty();`,
    execute: () => {
      return [...students].sort((a, b) => b.marks - a.marks);
    }
  },
  11: {
    badge: "Requirement 11",
    title: "Create an Index on rollNo",
    desc: "Creates a unique ascending index on the rollNo field for fast O(log N) lookups.",
    code: `// Create an ascending unique index on rollNo\ndb.students.createIndex(\n  { rollNo: 1 },\n  { unique: true, name: "rollNo_1" }\n);\n\n// View all existing indexes on the collection\ndb.students.getIndexes();`,
    execute: () => {
      isIndexActive = true;
      updateIndexUI();
      return {
        indexes: [
          { v: 2, key: { _id: 1 }, name: "_id_" },
          { v: 2, key: { rollNo: 1 }, name: "rollNo_1", unique: true }
        ],
        status: "Index 'rollNo_1' successfully created on field rollNo"
      };
    }
  },
  12: {
    badge: "Requirement 12",
    title: "Demonstrate Why Indexing is Useful for Searching Records",
    desc: "Compares query performance without an index (COLLSCAN) vs with an index on rollNo (IXSCAN) using explain('executionStats').",
    code: `// [A] WITHOUT INDEX (COLLSCAN): Scans all documents in collection\ndb.students.find({ email: "ravi.kumar.aiml@college.edu" }).explain("executionStats");\n\n// [B] WITH INDEX on rollNo (IXSCAN): B-Tree direct lookup\ndb.students.find({ rollNo: "23CM001" }).explain("executionStats");`,
    execute: () => {
      return {
        comparison: {
          withoutIndex: {
            stage: "COLLSCAN",
            explanation: "Linear Collection Scan: MongoDB inspects every document in the collection sequentially.",
            totalDocsExamined: students.length,
            totalKeysExamined: 0,
            nReturned: 1,
            timeComplexity: "O(N)"
          },
          withIndex: {
            stage: "IXSCAN -> FETCH",
            indexName: "rollNo_1",
            explanation: "B-Tree Index Scan: MongoDB jumps directly to the leaf node pointer via binary/tree search.",
            totalDocsExamined: 1,
            totalKeysExamined: 1,
            nReturned: 1,
            timeComplexity: "O(log N)"
          },
          keyTakeaways: [
            "1. In a college with 50,000 students, COLLSCAN examines 50,000 docs while IXSCAN examines only 1 key.",
            "2. Disk I/O is reduced by over 99.9%, drastically lowering server CPU and memory usage.",
            "3. Unique index enforces constraint integrity preventing duplicate student roll numbers."
          ]
        }
      };
    }
  }
};

// ============================================================================
// DOM Elements
// ============================================================================
const navTabs = document.querySelectorAll(".nav-tab");
const tabPanes = {
  directory: document.getElementById("pane-directory"),
  "lab-tasks": document.getElementById("pane-lab-tasks"),
  "indexing-demo": document.getElementById("pane-indexing-demo"),
  "raw-queries": document.getElementById("pane-raw-queries")
};

// Directory Elements
const searchInput = document.getElementById("filter-search-input");
const btnClearSearch = document.getElementById("btn-clear-search");
const branchSelect = document.getElementById("filter-branch-select");
const yearSelect = document.getElementById("filter-year-select");
const marksSelect = document.getElementById("filter-marks-preset");
const sortSelect = document.getElementById("filter-sort-select");
const btnResetFilters = document.getElementById("btn-reset-filters");
const currentQueryCode = document.getElementById("current-query-code");
const btnCopyLiveQuery = document.getElementById("btn-copy-live-query");
const studentsTbody = document.getElementById("students-tbody");
const studentsCardGrid = document.getElementById("students-card-grid");
const studentsTableWrapper = document.getElementById("students-table-wrapper");
const emptyState = document.getElementById("empty-state");
const resultsCountBadge = document.getElementById("results-count-badge");
const btnViewTable = document.getElementById("view-mode-table");
const btnViewCards = document.getElementById("view-mode-cards");

// Metrics Elements
const statTotalStudents = document.getElementById("stat-total-students");
const statAvgMarks = document.getElementById("stat-avg-marks");
const statTopMarks = document.getElementById("stat-top-marks");
const statTopStudent = document.getElementById("stat-top-student");
const statIndexBadge = document.getElementById("stat-index-badge");
const statIndexDetails = document.getElementById("stat-index-details");

// Modals
const studentModal = document.getElementById("student-modal");
const studentForm = document.getElementById("student-form");
const modalTitle = document.getElementById("modal-title");
const formRollNo = document.getElementById("form-rollNo");
const formName = document.getElementById("form-name");
const formBranch = document.getElementById("form-branch");
const formYear = document.getElementById("form-year");
const formMarks = document.getElementById("form-marks");
const formEmail = document.getElementById("form-email");

const updateMarksModal = document.getElementById("update-marks-modal");
const updateMarksForm = document.getElementById("update-marks-form");
const updateMarksRollDisplay = document.getElementById("update-marks-roll-display");
const updateMarksInput = document.getElementById("update-marks-input");

const updateFieldsModal = document.getElementById("update-fields-modal");
const updateFieldsForm = document.getElementById("update-fields-form");
const updateFieldsRollDisplay = document.getElementById("update-fields-roll-display");
const updateBranchInput = document.getElementById("update-branch-input");
const updateEmailInput = document.getElementById("update-email-input");

// Lab Tasks Elements
const taskListItems = document.querySelectorAll(".task-item");
const taskDetailBadge = document.getElementById("task-detail-badge");
const taskDetailTitle = document.getElementById("task-detail-title");
const taskDetailDesc = document.getElementById("task-detail-desc");
const taskCodeDisplay = document.getElementById("task-code-display");
const taskOutputDisplay = document.getElementById("task-output-display");
const taskExecTime = document.getElementById("task-exec-time");
const btnExecuteTask = document.getElementById("btn-execute-task");
const btnCopyTaskCode = document.getElementById("btn-copy-task-code");

// Index Benchmark Elements
const indexToggleState = document.getElementById("index-toggle-state");
const btnToggleIndex = document.getElementById("btn-toggle-index");
const datasetSizeSlider = document.getElementById("dataset-size-slider");
const datasetSizeVal = document.getElementById("dataset-size-val");
const benchmarkTargetRoll = document.getElementById("benchmark-target-roll");
const btnRunBenchmark = document.getElementById("btn-run-benchmark");
const collscanDocsExamined = document.getElementById("collscan-docs-examined");
const collscanTime = document.getElementById("collscan-time");
const barCollscan = document.getElementById("bar-collscan");
const ixscanDocsExamined = document.getElementById("ixscan-docs-examined");
const ixscanTime = document.getElementById("ixscan-time");
const barIxscan = document.getElementById("bar-ixscan");

// Toast
const toastContainer = document.getElementById("toast-container");

// ============================================================================
// Initialization
// ============================================================================
function init() {
  setupNavigation();
  setupFilters();
  setupModals();
  setupTasksRunner();
  setupBenchmark();
  setupRawScriptViewer();
  renderMetrics();
  renderDirectory();
  selectTask(1);

  // Global action buttons
  document.getElementById("btn-seed-data").addEventListener("click", () => {
    students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    saveState();
    renderMetrics();
    renderDirectory();
    showToast("Reset database: loaded 8 standard student documents", "info");
  });

  document.getElementById("btn-open-add-modal").addEventListener("click", () => {
    openAddStudentModal();
  });

  document.getElementById("btn-empty-reset").addEventListener("click", resetFilters);
}

// ============================================================================
// Navigation Tabs
// ============================================================================
function setupNavigation() {
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;
      activeTab = targetTab;

      navTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      Object.keys(tabPanes).forEach(paneKey => {
        if (paneKey === targetTab) {
          tabPanes[paneKey].classList.add("active");
        } else {
          tabPanes[paneKey].classList.remove("active");
        }
      });
    });
  });

  // View switch: table vs cards
  btnViewTable.addEventListener("click", () => {
    viewMode = "table";
    btnViewTable.classList.add("active");
    btnViewCards.classList.remove("active");
    studentsTableWrapper.classList.remove("hidden");
    studentsCardGrid.classList.add("hidden");
  });

  btnViewCards.addEventListener("click", () => {
    viewMode = "cards";
    btnViewCards.classList.add("active");
    btnViewTable.classList.remove("active");
    studentsTableWrapper.classList.add("hidden");
    studentsCardGrid.classList.remove("hidden");
  });
}

// ============================================================================
// Directory & Filter Engine
// ============================================================================
function setupFilters() {
  searchInput.addEventListener("input", () => {
    btnClearSearch.style.display = searchInput.value ? "block" : "none";
    renderDirectory();
  });

  btnClearSearch.addEventListener("click", () => {
    searchInput.value = "";
    btnClearSearch.style.display = "none";
    renderDirectory();
  });

  branchSelect.addEventListener("change", renderDirectory);
  yearSelect.addEventListener("change", renderDirectory);
  marksSelect.addEventListener("change", renderDirectory);
  sortSelect.addEventListener("change", renderDirectory);
  btnResetFilters.addEventListener("click", resetFilters);

  btnCopyLiveQuery.addEventListener("click", () => {
    navigator.clipboard.writeText(currentQueryCode.textContent);
    showToast("MongoDB query copied to clipboard!", "success");
  });
}

function resetFilters() {
  searchInput.value = "";
  btnClearSearch.style.display = "none";
  branchSelect.value = "ALL";
  yearSelect.value = "ALL";
  marksSelect.value = "ALL";
  sortSelect.value = "marks-desc";
  renderDirectory();
  showToast("Filters have been reset", "info");
}

function getFilteredAndSortedStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const branch = branchSelect.value;
  const year = yearSelect.value;
  const marksPreset = marksSelect.value;
  const sort = sortSelect.value;

  // Build simulated MongoDB query string representation
  let mongoFilter = {};
  let mongoSort = {};

  let result = students.filter(s => {
    // Search
    if (query) {
      const matchRoll = s.rollNo.toLowerCase().includes(query);
      const matchName = s.name.toLowerCase().includes(query);
      const matchEmail = s.email.toLowerCase().includes(query);
      if (!matchRoll && !matchName && !matchEmail) return false;
    }

    // Branch
    if (branch !== "ALL" && s.branch !== branch) return false;

    // Year
    if (year !== "ALL" && s.year !== parseInt(year)) return false;

    // Marks
    if (marksPreset === "gt75" && !(s.marks > 75)) return false;
    if (marksPreset === "gte80" && !(s.marks >= 80)) return false;
    if (marksPreset === "gte90" && !(s.marks >= 90)) return false;

    return true;
  });

  // Build filter object for query preview
  if (query) mongoFilter.$or = [{ rollNo: query }, { name: query }];
  if (branch !== "ALL") mongoFilter.branch = branch;
  if (year !== "ALL") mongoFilter.year = parseInt(year);
  if (marksPreset === "gt75") mongoFilter.marks = { $gt: 75 };
  if (marksPreset === "gte80") mongoFilter.marks = { $gte: 80 };
  if (marksPreset === "gte90") mongoFilter.marks = { $gte: 90 };

  // Sorting
  if (sort === "marks-desc") {
    result.sort((a, b) => b.marks - a.marks);
    mongoSort = { marks: -1 };
  } else if (sort === "marks-asc") {
    result.sort((a, b) => a.marks - b.marks);
    mongoSort = { marks: 1 };
  } else if (sort === "roll-asc") {
    result.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    mongoSort = { rollNo: 1 };
  } else if (sort === "name-asc") {
    result.sort((a, b) => a.name.localeCompare(b.name));
    mongoSort = { name: 1 };
  }

  // Update query preview banner
  const filterStr = Object.keys(mongoFilter).length ? JSON.stringify(mongoFilter) : "";
  const sortStr = Object.keys(mongoSort).length ? `.sort(${JSON.stringify(mongoSort)})` : "";
  currentQueryCode.textContent = `db.students.find(${filterStr})${sortStr}.pretty()`;

  return result;
}

function renderDirectory() {
  const filtered = getFilteredAndSortedStudents();
  resultsCountBadge.textContent = `${filtered.length} records`;

  if (filtered.length === 0) {
    studentsTableWrapper.classList.add("hidden");
    studentsCardGrid.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  if (viewMode === "table") {
    studentsTableWrapper.classList.remove("hidden");
    studentsCardGrid.classList.add("hidden");
  } else {
    studentsTableWrapper.classList.add("hidden");
    studentsCardGrid.classList.remove("hidden");
  }

  // Render Table Rows
  studentsTbody.innerHTML = filtered.map(student => {
    const branchClass = getBranchClass(student.branch);
    const marksClass = student.marks >= 85 ? "high" : student.marks >= 70 ? "med" : "low";

    return `
      <tr data-roll="${student.rollNo}">
        <td>
          <span class="roll-cell">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${escapeHtml(student.rollNo)}
          </span>
        </td>
        <td><strong>${escapeHtml(student.name)}</strong></td>
        <td><span class="branch-pill ${branchClass}">${escapeHtml(student.branch)}</span></td>
        <td>Year ${student.year}</td>
        <td><span class="marks-badge ${marksClass}">${student.marks}</span></td>
        <td><span class="card-email">${escapeHtml(student.email)}</span></td>
        <td style="text-align: right;">
          <div class="table-actions">
            <button class="btn-table-action" onclick="openUpdateMarksModal('${student.rollNo}', ${student.marks})" title="Update Marks">
              Marks
            </button>
            <button class="btn-table-action" onclick="openUpdateFieldsModal('${student.rollNo}', '${escapeHtml(student.branch)}', '${escapeHtml(student.email)}')" title="Update Branch/Email">
              Edit
            </button>
            <button class="btn-table-action delete" onclick="deleteStudentRecord('${student.rollNo}')" title="Delete using rollNo">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // Render Cards
  studentsCardGrid.innerHTML = filtered.map(student => {
    const branchClass = getBranchClass(student.branch);
    const marksClass = student.marks >= 85 ? "high" : student.marks >= 70 ? "med" : "low";

    return `
      <div class="student-card">
        <div class="card-top">
          <div>
            <div class="card-roll">${escapeHtml(student.rollNo)}</div>
            <div class="card-name">${escapeHtml(student.name)}</div>
          </div>
          <span class="branch-pill ${branchClass}">${escapeHtml(student.branch)}</span>
        </div>
        <div class="card-meta-row">
          <span>Academic Year: <strong>${student.year}</strong></span>
          <span>Score: <strong class="marks-badge ${marksClass}">${student.marks}/100</strong></span>
        </div>
        <div class="card-email">${escapeHtml(student.email)}</div>
        <div class="card-actions">
          <button class="btn-table-action" onclick="openUpdateMarksModal('${student.rollNo}', ${student.marks})">Update Marks</button>
          <button class="btn-table-action" onclick="openUpdateFieldsModal('${student.rollNo}', '${escapeHtml(student.branch)}', '${escapeHtml(student.email)}')">Edit Info</button>
          <button class="btn-table-action delete" onclick="deleteStudentRecord('${student.rollNo}')">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

function getBranchClass(branch) {
  const b = branch.toUpperCase();
  if (b.includes("AIML")) return "aiml";
  if (b.includes("CSE")) return "cse";
  if (b.includes("ECE")) return "ece";
  if (b.includes("IT")) return "it";
  return "";
}

// ============================================================================
// Metrics & Statistics
// ============================================================================
function renderMetrics() {
  statTotalStudents.textContent = students.length;

  if (students.length > 0) {
    const totalMarks = students.reduce((sum, s) => sum + s.marks, 0);
    const avg = (totalMarks / students.length).toFixed(1);
    statAvgMarks.textContent = `${avg}%`;

    const top = [...students].sort((a, b) => b.marks - a.marks)[0];
    statTopMarks.textContent = top.marks;
    statTopStudent.textContent = `${top.name} (${top.rollNo})`;
  } else {
    statAvgMarks.textContent = "0%";
    statTopMarks.textContent = "0";
    statTopStudent.textContent = "No data";
  }

  updateIndexUI();
}

function updateIndexUI() {
  if (isIndexActive) {
    statIndexBadge.textContent = "rollNo_1 Active";
    statIndexBadge.className = "metric-value status-badge";
    statIndexDetails.textContent = "B-Tree Unique Index";
    indexToggleState.textContent = "ENABLED (Unique)";
    indexToggleState.style.color = "var(--accent-green)";
    btnToggleIndex.textContent = "Drop Index (rollNo_1)";
  } else {
    statIndexBadge.textContent = "No Custom Index";
    statIndexBadge.className = "metric-value status-badge";
    statIndexBadge.style.color = "var(--accent-amber)";
    statIndexBadge.style.background = "rgba(245, 158, 11, 0.1)";
    statIndexDetails.textContent = "COLLSCAN Fallback";
    indexToggleState.textContent = "DISABLED (Collection Scan)";
    indexToggleState.style.color = "var(--accent-red)";
    btnToggleIndex.textContent = "Create Index on rollNo";
  }
}

// ============================================================================
// CRUD Modals & Handlers
// ============================================================================
function setupModals() {
  // Add Student Modal
  document.getElementById("btn-close-modal").addEventListener("click", closeAddModal);
  document.getElementById("btn-cancel-modal").addEventListener("click", closeAddModal);

  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const rollNo = formRollNo.value.trim().toUpperCase();
    const name = formName.value.trim();
    const branch = formBranch.value.trim();
    const year = parseInt(formYear.value);
    const marks = parseInt(formMarks.value);
    const email = formEmail.value.trim();

    // Check unique rollNo if index is active
    if (isIndexActive && students.some(s => s.rollNo.toUpperCase() === rollNo)) {
      showToast(`E11000 duplicate key error: rollNo "${rollNo}" already exists!`, "error");
      return;
    }

    students.push({ rollNo, name, branch, year, marks, email });
    saveState();
    renderMetrics();
    renderDirectory();
    closeAddModal();
    showToast(`Inserted student record: ${rollNo} (${name})`, "success");
  });

  // Update Marks Modal
  document.getElementById("btn-close-marks-modal").addEventListener("click", () => updateMarksModal.classList.add("hidden"));
  document.getElementById("btn-cancel-marks-modal").addEventListener("click", () => updateMarksModal.classList.add("hidden"));

  updateMarksForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newMarks = parseInt(updateMarksInput.value);
    const student = students.find(s => s.rollNo === currentEditingRoll);
    if (student) {
      student.marks = newMarks;
      saveState();
      renderMetrics();
      renderDirectory();
      updateMarksModal.classList.add("hidden");
      showToast(`Updated marks for ${student.rollNo} to ${newMarks}`, "success");
    }
  });

  // Update Fields Modal
  document.getElementById("btn-close-fields-modal").addEventListener("click", () => updateFieldsModal.classList.add("hidden"));
  document.getElementById("btn-cancel-fields-modal").addEventListener("click", () => updateFieldsModal.classList.add("hidden"));

  updateFieldsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const student = students.find(s => s.rollNo === currentEditingRoll);
    if (student) {
      student.branch = updateBranchInput.value.trim();
      student.email = updateEmailInput.value.trim();
      saveState();
      renderMetrics();
      renderDirectory();
      updateFieldsModal.classList.add("hidden");
      showToast(`Updated fields for ${student.rollNo}`, "success");
    }
  });
}

function openAddStudentModal() {
  studentForm.reset();
  formYear.value = "3";
  studentModal.classList.remove("hidden");
  formRollNo.focus();
}

function closeAddModal() {
  studentModal.classList.add("hidden");
}

window.openUpdateMarksModal = function(rollNo, currentMarks) {
  currentEditingRoll = rollNo;
  updateMarksRollDisplay.textContent = rollNo;
  updateMarksInput.value = currentMarks;
  updateMarksModal.classList.remove("hidden");
  updateMarksInput.focus();
};

window.openUpdateFieldsModal = function(rollNo, currentBranch, currentEmail) {
  currentEditingRoll = rollNo;
  updateFieldsRollDisplay.textContent = rollNo;
  updateBranchInput.value = currentBranch;
  updateEmailInput.value = currentEmail;
  updateFieldsModal.classList.remove("hidden");
  updateBranchInput.focus();
};

window.deleteStudentRecord = function(rollNo) {
  if (confirm(`Execute db.students.deleteOne({ rollNo: "${rollNo}" })?`)) {
    students = students.filter(s => s.rollNo !== rollNo);
    saveState();
    renderMetrics();
    renderDirectory();
    showToast(`Deleted student record ${rollNo} from collection`, "warning");
  }
};

// ============================================================================
// 12 Lab Tasks Quick-Runner
// ============================================================================
let selectedTaskId = 1;

function setupTasksRunner() {
  taskListItems.forEach(item => {
    item.addEventListener("click", () => {
      const taskId = parseInt(item.dataset.task);
      selectTask(taskId);
    });
  });

  btnExecuteTask.addEventListener("click", () => {
    executeCurrentTask();
  });

  btnCopyTaskCode.addEventListener("click", () => {
    const task = LAB_TASKS[selectedTaskId];
    navigator.clipboard.writeText(task.code);
    showToast(`Requirement ${selectedTaskId} query copied!`, "success");
  });
}

function selectTask(taskId) {
  selectedTaskId = taskId;
  taskListItems.forEach(item => {
    if (parseInt(item.dataset.task) === taskId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  const task = LAB_TASKS[taskId];
  taskDetailBadge.textContent = task.badge;
  taskDetailTitle.textContent = task.title;
  taskDetailDesc.textContent = task.desc;
  taskCodeDisplay.textContent = task.code;

  executeCurrentTask();
}

function executeCurrentTask() {
  const task = LAB_TASKS[selectedTaskId];
  const t0 = performance.now();
  const result = task.execute();
  const t1 = performance.now();
  const execTime = (t1 - t0).toFixed(2);

  taskExecTime.textContent = `Execution: ${execTime} ms`;
  taskOutputDisplay.innerHTML = `<pre><code>${escapeHtml(JSON.stringify(result, null, 2))}</code></pre>`;

  renderMetrics();
  renderDirectory();
}

// ============================================================================
// Index Benchmark Studio (COLLSCAN vs IXSCAN)
// ============================================================================
function setupBenchmark() {
  datasetSizeSlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    datasetSizeVal.textContent = val.toLocaleString();
    runBenchmarkSimulation(val);
  });

  btnRunBenchmark.addEventListener("click", () => {
    const val = parseInt(datasetSizeSlider.value);
    runBenchmarkSimulation(val);
    showToast("Benchmark executionStats computed!", "success");
  });

  btnToggleIndex.addEventListener("click", () => {
    isIndexActive = !isIndexActive;
    updateIndexUI();
    const val = parseInt(datasetSizeSlider.value);
    runBenchmarkSimulation(val);
    showToast(isIndexActive ? "Created index: rollNo_1" : "Dropped index: rollNo_1", isIndexActive ? "success" : "warning");
  });

  // Run initial simulation
  runBenchmarkSimulation(50000);
}

function runBenchmarkSimulation(datasetSize) {
  // COLLSCAN simulation:
  // Must scan every document sequentially. Time proportional to N.
  const collscanTimeMs = (datasetSize * 0.00075 + (Math.random() * 0.8)).toFixed(2);
  collscanDocsExamined.textContent = `${datasetSize.toLocaleString()} docs`;
  collscanTime.textContent = `${collscanTimeMs} ms`;
  barCollscan.style.width = "100%";

  // IXSCAN simulation:
  // B-Tree search has depth ~ ceil(log_m(N)). Typically ~3-4 page reads in memory.
  const ixscanTimeMs = (0.04 + (Math.random() * 0.03)).toFixed(2);
  const speedup = Math.round(collscanTimeMs / ixscanTimeMs);
  ixscanDocsExamined.textContent = `1 doc`;
  ixscanTime.textContent = `${ixscanTimeMs} ms (${speedup}x faster)`;
  barIxscan.style.width = "0.4%";
}

// ============================================================================
// Raw Script Viewer
// ============================================================================
const FULL_MONGODB_SCRIPT = `// =============================================================================
// DATABASE: collegeDB
// COLLECTION: students
// =============================================================================

// Switch to collegeDB
use collegeDB;

// Reset / drop previous collection
db.students.drop();

// 1. Insert multiple student documents
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

// 2. Display all students
db.students.find().pretty();

// 3. Display students belonging to CSE-AIML branch
db.students.find({ branch: "CSE-AIML" }).pretty();

// 4. Display students who scored more than 75 marks
db.students.find({ marks: { $gt: 75 } }).pretty();

// 5. Search for a student using rollNo
db.students.find({ rollNo: "23CM001" }).pretty();

// 6. Search students based on condition (year: 3 and marks >= 80)
db.students.find({ year: 3, marks: { $gte: 80 } }).pretty();

// 7. Update marks of student 23CM001 to 96
db.students.updateOne(
  { rollNo: "23CM001" },
  { $set: { marks: 96 } }
);

// 8. Update email and branch for student 23CM001
db.students.updateOne(
  { rollNo: "23CM001" },
  {
    $set: {
      email: "ravi.kumar.aiml@college.edu",
      branch: "CSE-AIML (Advanced)"
    }
  }
);

// 9. Delete a student record using rollNo
db.students.deleteOne({ rollNo: "23DS007" });

// 10. Display students in descending order of marks
db.students.find().sort({ marks: -1 }).pretty();

// 11. Create an index on rollNo
db.students.createIndex({ rollNo: 1 }, { unique: true });

// 12. Demonstrate indexing usefulness with explain('executionStats')
// Unindexed field query (COLLSCAN)
db.students.find({ email: "ravi.kumar.aiml@college.edu" }).explain("executionStats");

// Indexed field query on rollNo (IXSCAN)
db.students.find({ rollNo: "23CM001" }).explain("executionStats");
`;

function setupRawScriptViewer() {
  const codeEl = document.getElementById("full-script-content");
  if (codeEl) {
    codeEl.textContent = FULL_MONGODB_SCRIPT;
  }

  document.getElementById("btn-copy-all-script").addEventListener("click", () => {
    navigator.clipboard.writeText(FULL_MONGODB_SCRIPT);
    showToast("Full MongoDB script copied to clipboard!", "success");
  });

  document.getElementById("btn-download-script").addEventListener("click", () => {
    const blob = new Blob([FULL_MONGODB_SCRIPT], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "collegeDB.mongodb.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded collegeDB.mongodb.js", "info");
  });
}

// ============================================================================
// Utilities
// ============================================================================
function saveState() {
  localStorage.setItem("collegeDB_students", JSON.stringify(students));
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "warning") icon = "⚠️";
  if (type === "error") icon = "❌";

  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Start application
document.addEventListener("DOMContentLoaded", init);
