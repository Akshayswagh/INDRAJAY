// Industrial Services Data Management
let services = [];
let currentServiceId = null;

// Service Functions
function showAddServiceForm() {
  hideAllSections();
  document.getElementById("add-service-form").style.display = "block";
  document.getElementById("serviceMessage").style.display = "none";
  document.getElementById("serviceForm").reset();
}

function showAllServices() {
  hideAllSections();
  document.getElementById("all-services").style.display = "block";
  renderServicesTable();
}

function addService(event) {
  event.preventDefault();

  const serviceName = document.getElementById("serviceName").value;
  const serviceDescription =
    document.getElementById("serviceDescription").value;
  const serviceImage = document.getElementById("serviceImage").files[0];

  if (!serviceImage) {
    alert("Please select an image");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const newService = {
      id: Date.now(),
      name: serviceName,
      description: serviceDescription,
      image: e.target.result,
      createdAt: new Date().toISOString(),
    };

    services.push(newService);
    document.getElementById("serviceForm").reset();

    // Show success message
    const messageElement = document.getElementById("serviceMessage");
    messageElement.style.display = "block";
    messageElement.textContent = "Service added successfully!";

    // Auto-hide message after 3 seconds
    setTimeout(() => {
      messageElement.style.display = "none";
    }, 3000);
  };
  reader.readAsDataURL(serviceImage);
}

function renderServicesTable() {
  const tableBody = document.getElementById("servicesTableBody");
  tableBody.innerHTML = "";

  if (services.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4 text-muted">
                    <i class="bi bi-exclamation-circle" style="font-size: 2rem;"></i>
                    <p class="mt-2">No services found. Add your first service!</p>
                </td>
            </tr>
        `;
    return;
  }

  services.forEach((service, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <a href="#" onclick="showServiceDetails(${
                  service.id
                }); return false;">
                    ${service.name}
                </a>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary" onclick="showServiceDetails(${
                  service.id
                })">
                    <i class="bi bi-eye"></i> View
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function showServiceDetails(serviceId) {
  const service = services.find((s) => s.id === serviceId);
  if (!service) return;

  currentServiceId = serviceId;

  // Set modal content
  document.getElementById("serviceModalTitle").textContent = service.name;
  document.getElementById("serviceModalBody").innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="mb-3">
                    <img src="${
                      service.image
                    }" class="img-fluid rounded" alt="${service.name}">
                </div>
            </div>
            <div class="col-md-8">
                <div class="mb-3">
                    <h6 class="text-muted">Service Name</h6>
                    <p>${service.name}</p>
                </div>
                <div class="mb-3">
                    <h6 class="text-muted">Description</h6>
                    <div class="p-3 bg-light rounded">
                        ${service.description}
                    </div>
                </div>
                <div class="mb-3">
                    <h6 class="text-muted">Added On</h6>
                    <p>${new Date(service.createdAt).toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;

  // Set button actions
  document.getElementById("editServiceBtn").onclick = function () {
    editService(serviceId);
  };

  document.getElementById("deleteServiceBtn").onclick = function () {
    deleteService(serviceId);
  };

  // Show modal
  const modal = new bootstrap.Modal(
    document.getElementById("serviceDetailsModal")
  );
  modal.show();
}

function editService(serviceId) {
  const service = services.find((s) => s.id === serviceId);
  if (!service) return;

  // Close the details modal
  bootstrap.Modal.getInstance(
    document.getElementById("serviceDetailsModal")
  ).hide();

  // Populate the edit form (using add form for editing)
  document.getElementById("serviceName").value = service.name;
  document.getElementById("serviceDescription").value = service.description;
  // Note: Image handling would need additional implementation

  // Show the form
  showAddServiceForm();

  // Change form to update mode
  document.getElementById("serviceForm").onsubmit = function (e) {
    e.preventDefault();
    updateService(serviceId);
  };

  document.querySelector('#serviceForm button[type="submit"]').innerHTML =
    '<i class="bi bi-save"></i> Update Service';
}

function updateService(serviceId) {
  const serviceIndex = services.findIndex((s) => s.id === serviceId);
  if (serviceIndex === -1) return;

  const serviceName = document.getElementById("serviceName").value;
  const serviceDescription =
    document.getElementById("serviceDescription").value;
  const serviceImageInput = document.getElementById("serviceImage");

  if (serviceImageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      services[serviceIndex] = {
        ...services[serviceIndex],
        name: serviceName,
        description: serviceDescription,
        image: e.target.result,
      };
      showAllServices();
    };
    reader.readAsDataURL(serviceImageInput.files[0]);
  } else {
    // Keep existing image if no new image was selected
    services[serviceIndex] = {
      ...services[serviceIndex],
      name: serviceName,
      description: serviceDescription,
    };
    showAllServices();
  }
}

function deleteService(serviceId) {
  if (confirm("Are you sure you want to delete this service?")) {
    services = services.filter((service) => service.id !== serviceId);
    bootstrap.Modal.getInstance(
      document.getElementById("serviceDetailsModal")
    ).hide();
    renderServicesTable();
  }
}
