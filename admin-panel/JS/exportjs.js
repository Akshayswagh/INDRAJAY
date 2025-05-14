function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("show");
}

function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  submenu.classList.toggle("show");
}

function toggleUserMenu() {
  document.getElementById("userDropdown").classList.toggle("show");
}

function showLoginForm() {
  // Hide all other sections
  document.getElementById("export-form").style.display = "none";
  document.getElementById("export-list").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  document.getElementById("add-job-form").style.display = "none";
  document.getElementById("all-jobs").style.display = "none";

  document.getElementById("add-event-form").style.display = "none";
  document.getElementById("all-events").style.display = "none";
  document.getElementById("serviceDetailsModal").style.display = "none";
  document.getElementById("all-services").style.display = "none";

  document.getElementById("add-service-form").style.display = "none";
}

function showExportForm() {
  // Hide all other sections
  document.getElementById("login-form").style.display = "none";
  document.getElementById("export-list").style.display = "none";
  document.getElementById("export-form").style.display = "block";
  document.getElementById("exportMessage").style.display = "none";
}


function getCategoryBadgeClass(category) {
  const classes = {
    'Grains & Cereals': 'bg-success',
    'Oil Seeds': 'bg-warning text-dark',
    'Pulses': 'bg-info text-dark'
  };
  return classes[category] || 'bg-light text-dark';
}
let isSortedByCategory = false;

function sortExportsByCategory() {
  // Define the desired category order
  const categoryOrder = [
    'Grains & Cereals',
    'Oil Seeds',
    'Pulses'
  ];
  
  // Toggle sorting direction
  if (isSortedByCategory) {
    // Return to original order
    exportsData.sort((a, b) => a._id.localeCompare(b._id));
    isSortedByCategory = false;
  } else {
    // Sort by category
    exportsData.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.category);
      const indexB = categoryOrder.indexOf(b.category);
      
      if (indexA < indexB) return -1;
      if (indexA > indexB) return 1;
      return 0;
    });
    isSortedByCategory = true;
  }
  
  loadExportData();
}
function filterExports(category) {
  if (category === 'all') {
    loadExportData();
  } else {
    const filteredData = exportsData.filter(item => item.category === category);
    renderFilteredExports(filteredData);
  }
  
  // Update dropdown button text
  const dropdownBtn = document.getElementById('filterDropdown');
  if (category === 'all') {
    dropdownBtn.innerHTML = '<i class="bi bi-funnel"></i> Filter';
  } else {
    dropdownBtn.innerHTML = `<i class="bi bi-funnel-fill"></i> ${category}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchExports();
  
  // Initialize sort button
  document.getElementById('sortByCategoryBtn').addEventListener('click', () => {
    sortExportsByCategory();
    const btn = document.getElementById('sortByCategoryBtn');
    btn.classList.toggle('active', isSortedByCategory);
  });
  
  // Close dropdown after selection
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all items
      document.querySelectorAll('.dropdown-item').forEach(i => {
        i.classList.remove('active');
      });
      // Add to clicked item
      this.classList.add('active');
    });
  });
});


















let exportsData = [];
let editIndex = -1;
let currentAction = null;
let currentItemId = null;

// ====================== API FUNCTIONS ======================
async function fetchExports() {
  try {
    console.log("Attempting to fetch exports...");
    const response = await fetch("/api/exports/allExports");

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Received data:", result);

    // Handle the nested data structure
    if (result.success && Array.isArray(result.data)) {
      exportsData = result.data; // Extract the array from response.data
      loadExportData();
      console.log("Exports loaded successfully");
    } else {
      throw new Error("API response format unexpected");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showPopup(`Failed to load exports: ${error.message}`, "error");
  }
}

async function addOrUpdateExport(exportItem) {
  const method = editIndex === -1 ? "POST" : "PUT";
  const url =
    editIndex === -1
      ? "/api/exports/addExport"
      : `/api/exports/${currentItemId}`;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exportItem),
    });

    if (!response.ok) throw new Error("Failed to save export");

    showPopup("Export saved successfully!", "success");

    fetchExports(); // Refresh data
  } catch (error) {
    showPopup("Error saving export: " + error.message, "error");
  }
}

async function deleteExportById(id) {
  try {
    const response = await fetch(`/api/exports/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete export");

    showPopup("Export deleted successfully!", "success");
    fetchExports(); // Refresh data
  } catch (error) {
    showPopup("Error deleting export: " + error.message, "error");
  }
}

// ====================== UI FUNCTIONS ======================
function showExportForm() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("export-list").style.display = "none";
  document.getElementById("export-form").style.display = "block";
  document.getElementById("exportMessage").style.display = "none";
}

function showExportList() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("export-form").style.display = "none";
  document.getElementById("export-list").style.display = "block";
  fetchExports(); // Load data from API
  console.log();
}

async function addExport(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const imageFile = document.getElementById("image").files[0];

  // Validation
  if (!imageFile) {
    showPopup("Please select an image.", "error");
    return;
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    showPopup("Image size exceeds the 5MB limit.", "error");
    return;
  }

  if (!name || !category || !description) {
    showPopup("Name, category and description are required", "error");
    return;
  }

  // Create FormData instead of JSON
  const formData = new FormData();
  formData.append("name", name);
  formData.append("category", category);
  formData.append("description", description);
  formData.append("image", imageFile);

  try {
    const response = await fetch("/api/exports/addExport", {
      method: "POST",
      body: formData, // No Content-Type header needed for FormData
      // The browser will automatically set multipart/form-data
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add export");
    }

    showPopup("Export added successfully!", "success");
    fetchExports(); // Refresh the list
    document.getElementById("exportForm").reset(); // Clear form
  } catch (error) {
    console.error("Error adding export:", error);
    showPopup(`Error: ${error.message}`, "error");
  }
}

function editExport(index) {
  const exportItem = exportsData[index];
  document.getElementById("name").value = exportItem.name;
  document.getElementById("category").value = exportItem.category;
  document.getElementById("description").value = exportItem.description;
  editIndex = index;
  currentItemId = exportItem._id; // Assuming MongoDB _id
  showExportForm();
}

function deleteExport(index) {
  currentItemId = exportsData[index]._id; // Assuming MongoDB _id
  showConfirmationPopup("Are you sure you want to delete this export?", () =>
    deleteExportById(currentItemId)
  );
}

function loadExportData() {
  const exportTableBody = document.getElementById("exportTableBody");
  exportTableBody.innerHTML = "";

  exportsData.forEach((exportItem, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${exportItem.name}</td>
      <td><img src="${exportItem.image}" alt="${
      exportItem.name
    }" width="50"></td>
     
<td style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap:10px">
  <button class="btn btn-primary" style="padding:6px 21px" onclick="editExport(${index})">Edit</button>
  <button class="btn btn-danger" onclick="deleteExport(${index})">Delete</button>
</td>

    `;
    exportTableBody.appendChild(row);
  });
}

// ====================== POPUP FUNCTIONS ======================
function showConfirmationPopup(message, onConfirm) {
  document.getElementById("popupMessage").textContent = message;
  document.getElementById("popup").style.display = "block";

  // Store the confirm action
  window.confirmAction = () => {
    onConfirm();
    closePopup();
  };
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function showPopup(message, type) {
  const popup = document.createElement("div");
  popup.className = `popup ${type}`;
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button onclick="this.parentElement.parentElement.remove()">OK</button>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", fetchExports);
