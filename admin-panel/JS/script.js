// Section Management Functions
function hideAllSections() {
  document.querySelectorAll(".section-container").forEach((section) => {
    section.style.display = "none";
  });
}

function showSection(sectionId) {
  hideAllSections();
  document.getElementById(sectionId).style.display = "block";
}

// Initialize - hide all sections on page load and show welcome
document.addEventListener("DOMContentLoaded", function () {
  hideAllSections();
  document.getElementById("welcome-section").style.display = "block";
});

function showAddJobForm() {
  // First hide all export-related sections
  document.getElementById("export-form").style.display = "none";
  document.getElementById("export-list").style.display = "none";
  hideAllSections();

  // Then show the career form
  showSection("add-job-form");
  document.getElementById("jobMessage").style.display = "none";
}

function showAllJobs() {
  // First hide all export-related sections
  document.getElementById("export-form").style.display = "none";
  document.getElementById("export-list").style.display = "none";

  // Then show the jobs table
  showSection("all-jobs");
  renderJobsTable();
}

let jobs = [];
let currentEditId = null;

// Show Add Job Form
async function addJob(event) {
  event.preventDefault();

  const newJob = {
    role: document.getElementById("position").value,
    domain: document.getElementById("domain").value,
    description: document.getElementById("jobDescription").value,
    experience_required: document.getElementById("experience").value,
  };

  console.log(newJob);

  try {
    const response = await fetch("/api/careers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newJob),
    });

    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      throw new Error(result.error || "Failed to add job");
    }

    // Show success message
    const messageElement = document.getElementById("jobMessage");
    messageElement.style.display = "block";
    messageElement.textContent = "Job added successfully!";
    messageElement.style.color = "green";

    // Reset form
    document.getElementById("jobForm").reset();

    // Reload jobs
    fetchJobsFromAPI();
    // Hide message after 3 seconds

    setTimeout(() => {
      messageElement.style.display = "none";
    }, 3000);
  } catch (error) {
    console.error("Error adding job:", error);
    showPopup("Failed to add job", "error");
  }
}

// Show All Jobs
function showAllJobs() {
  hideAllSections();

  showSection("all-jobs");
  fetchJobsFromAPI();
}

// Render Jobs Table
function renderJobsTable() {
  const tableBody = document.getElementById("jobsTableBody");
  tableBody.innerHTML = "";

  jobs.forEach((job, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${job.role}</td>
      <td>${job.domain}</td>
      <td>${job.experience_required}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editJob('${job._id}')">
          Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteJob('${job._id}')">
          Delete
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Fetch Jobs from API
async function fetchJobsFromAPI() {
  try {
    const response = await fetch("/api/careers");
    const result = await response.json();

    // Assuming the result is an array of jobs or wrapped in a 'data' property
    jobs = Array.isArray(result) ? result : result.data;

    if (!Array.isArray(jobs)) {
      throw new Error("Jobs data is not an array.");
    }

    renderJobsTable();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    alert("Failed to load jobs.");
  }
}

// Add Job

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("jobForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newJob = {
      role: document.getElementById("position").value,
      domain: document.getElementById("domain").value,
      description: document.getElementById("jobDescription").value,
      experience_required: document.getElementById("experience").value,
    };

    try {
      const response = await fetch("/api/careers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJob),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add job");
      }

      document.getElementById("jobMessage").textContent =
        "Job added successfully!";
      document.getElementById("jobMessage").style.display = "block";
      document.getElementById("jobMessage").style.color = "green";
      form.reset();

      fetchJobsFromAPI();

      setTimeout(() => {
        document.getElementById("jobMessage").style.display = "none";
      }, 3000);
    } catch (error) {
      console.error("Error adding job:", error);
      alert("Job adding failed");
    }
  });
});

// Edit Job
function editJob(jobId) {
  const job = jobs.find((j) => j._id === jobId); // Find job by MongoDB _id
  if (!job) return;

  currentEditId = jobId;
  document.getElementById("editJobId").value = jobId;
  document.getElementById("editPosition").value = job.role;
  document.getElementById("editDomain").value = job.domain;
  document.getElementById("editExperience").value = job.experience_required;
  document.getElementById("editJobDescription").value = job.description;
  hideAllSections();

  showSection("edit-job-form");
}

async function updateJob(event) {
  event.preventDefault();

  // Check if currentEditId is properly set
  if (!currentEditId) {
    console.error("No job selected for editing.");
    return;
  }

  // Create updated job data
  const updatedJob = {
    role: document.getElementById("editPosition").value,
    domain: document.getElementById("editDomain").value,
    experience_required: document.getElementById("editExperience").value,
    description: document.getElementById("editJobDescription").value,
  };

  try {
    // Send PUT request to the backend with the job ID and updated data
    const response = await fetch(`/api/careers/${currentEditId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedJob),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update job");
    }

    // Show success message
    showPopup("Job updated successfully", "success");

    hideAllSections();
    // Refresh job list
    showAllJobs();
  } catch (error) {
    console.error("Error updating job:", error);
    showPopup("Failed to update job", "error");
  }
}

let jobIdToDelete = null; // Stores the job ID to be deleted

// Shows the delete confirmation popup
function deleteJob(jobId) {
  console.log("Delete button clicked. Job ID:", jobId); // ✅ Debug log
  jobIdToDelete = jobId;
  document.getElementById("deletePopup").style.display = "block";
}
document.addEventListener("DOMContentLoaded", () => {
  const deletePopup = document.getElementById("deletePopup");
  const okayBtn = document.getElementById("careerokayButton");
  const cancelBtn = document.getElementById("careercancelButton");

  // ✅ OK Button: Delete the job
  okayBtn.addEventListener("click", async () => {
    if (!jobIdToDelete) {
      showPopup("No job ID selected for deletion!");
      return;
    }

    try {
      const response = await fetch(`/api/careers/${jobIdToDelete}`, {
        method: "DELETE",
      });

      console.log("Delete API response:", response); // ✅ Debug log

      if (!response.ok) throw new Error("Failed to delete job");

      showPopup("Job deleted successfully", "success");
      fetchJobsFromAPI();
    } catch (error) {
      console.error("Delete error:", error);
      showPopup("Failed to delete job", "error");
    } finally {
      document.getElementById("deletePopup").style.display = "none";
      jobIdToDelete = null;
    }
  });

  cancelBtn.addEventListener("click", () => {
    console.log("Cancel clicked. Hiding popup."); // ✅ Debug log
    document.getElementById("deletePopup").style.display = "none";
    jobIdToDelete = null;
  });
});

// Show Popup
function showPopup(message, type) {
  const popup = document.createElement("div");
  popup.classList.add("popup", type); // Add class based on the type (success or error)
  popup.innerHTML = `
    <span>${message}</span>
    <button onclick="closePopup()">Okay</button>
  `;

  document.body.appendChild(popup);
  setTimeout(closePopup, 3000); // Automatically close after 3 seconds

  function closePopup() {
    popup.remove();
  }
}

// Show Export Form
function showExportForm() {
  document.getElementById("add-job-form").style.display = "none";
  document.getElementById("all-jobs").style.display = "none";
  document.getElementById("edit-job-form").style.display = "none";

  showSection("export-form");
}

// Helper Function to Show Sections
function showSection(sectionId) {
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => {
    section.style.display = "none";
  });
  document.getElementById(sectionId).style.display = "block";
}
