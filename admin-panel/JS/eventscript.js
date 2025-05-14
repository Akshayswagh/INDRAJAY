// Event Data Management
// let events = [];

// Event Functions
function showAddEventForm() {
  // Hide other sections
  hideAllSections();
  // Show event form
  document.getElementById("add-event-form").style.display = "block";
  document.getElementById("eventMessage").style.display = "none";
}

function showAllEvents() {
  hideAllSections();
  document.getElementById("all-events").style.display = "block";
  fetchEvents(); // Replace the old static render call
}

async function addEvent(event) {
  event.preventDefault();

  const name = document.getElementById("eventName").value;
  const venue = document.getElementById("venue").value;
  const timeDateValue = document.getElementById("timeDate").value;
  const category = document.getElementById("categoryInput").value;
  const description = document.getElementById("eventDescription").value;

  // Separate date and time from datetime-local input
  const [date, time] = timeDateValue.split("T");

  // Prepare FormData for file + fields
  const formData = new FormData();
  formData.append("name", name);
  formData.append("venue", venue);
  formData.append("date", date);
  formData.append("time", time);
  formData.append("category", category);
  formData.append("description", description);

  // Handle image upload if needed (assume a file input with id="eventImage")
  const imageInput = document.getElementById("eventImage");
  if (imageInput && imageInput.files.length > 0) {
    formData.append("image", imageInput.files[0]);
  } else {
    showMessage("Please upload an event image.", "red");
    return;
  }

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to add event");
    }

    // Reset form and show success
    document.getElementById("eventForm").reset();
    showMessage("Event added successfully!", "green");
  } catch (error) {
    console.error("Error adding event:", error);
    showMessage(error.message || "Failed to add event", "red");
  }
}

function showMessage(message, color) {
  const messageElement = document.getElementById("popupMessage");
  const popup = document.getElementById("popup");
  const okayButton = document.getElementById("okayButton");

  // Set the message and color dynamically
  messageElement.textContent = message;
  messageElement.style.color = color;

  // Show the popup with an animation
  popup.style.display = "block";

  // Add a delay for the button to appear after the message
  setTimeout(() => {
    okayButton.style.opacity = "1";
  }, 500); // Button fades in after 0.5s delay
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
}

async function fetchEvents() {
  try {
    const response = await fetch("/api/events");
    if (!response.ok) throw new Error("Failed to fetch events");

    const result = await response.json();
    const events = result.data; // ✅ use .data from the response

    const tableBody = document.getElementById("eventsTableBody");
    tableBody.innerHTML = "";

    events.forEach((event) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${event.name}</td>
        <td>${event.venue}</td>
        <td>${event.category}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="showEventDetails(${event._id})">View</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event._id}')">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

function showEventDetails(eventId) {
  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  // Format the date for display
  const eventDate = new Date(event.timeDate);
  const formattedDate = eventDate.toLocaleString();

  // Set modal content
  document.getElementById("eventModalTitle").textContent = event.name;
  document.getElementById("eventModalBody").innerHTML = `
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Category:</strong> ${event.category}</p>
        <p><strong>Description:</strong> ${event.description}</p>
    `;

  // Show modal
  const modal = new bootstrap.Modal(
    document.getElementById("eventDetailsModal")
  );
  modal.show();
}

// Variable to hold the delete function
let deleteAction = null;

// Show confirmation popup
function showDeleteConfirmation(eventId) {
  const messageElement = document.getElementById("popupMessage");
  const popup = document.getElementById("popup");
  const okayButton = document.getElementById("okayButton");
  const cancelButton = document.getElementById("cancelButton");

  // Set the message for confirmation
  messageElement.textContent = "Are you sure you want to delete this event?";
  messageElement.style.color = "black";

  // Show the popup
  popup.style.display = "block";

  // Set the delete action (deleteEvent) to be triggered on confirm
  deleteAction = async function () {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete event");
      }

      // Show success message and hide popup
      showSuccessMessage("Event deleted successfully!");

      // Refresh the event list
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      showErrorMessage("Failed to delete the event.");
    }
  };

  // Show the buttons after a delay
  setTimeout(() => {
    okayButton.style.opacity = "1";
    cancelButton.style.opacity = "1";
  }, 500);
}

// Function to show success message
function showSuccessMessage(message) {
  const messageElement = document.getElementById("popupMessage");
  const popup = document.getElementById("popup");
  const okayButton = document.getElementById("okayButton");
  const cancelButton = document.getElementById("cancelButton");

  messageElement.textContent = message;
  messageElement.style.color = "green";

  // Hide cancel button, as it's not needed for success
  cancelButton.style.display = "none";

  // Show success popup
  popup.style.display = "block";

  // Hide the buttons after 3 seconds
  setTimeout(() => {
    closePopup();
  }, 3000);
}

// Function to show error message
function showErrorMessage(message) {
  const messageElement = document.getElementById("popupMessage");
  const popup = document.getElementById("popup");
  const okayButton = document.getElementById("okayButton");
  const cancelButton = document.getElementById("cancelButton");

  messageElement.textContent = message;
  messageElement.style.color = "red";

  // Hide cancel button, as it's not needed for error
  cancelButton.style.display = "none";

  // Show error popup
  popup.style.display = "block";

  // Hide the buttons after 3 seconds
  setTimeout(() => {
    closePopup();
  }, 3000);
}

// Handle the "Okay" button click (confirm delete action)
function confirmAction() {
  if (deleteAction) {
    deleteAction(); // Call the delete function passed earlier
  }
  closePopup();
}

// Close the popup
function closePopup() {
  const popup = document.getElementById("popup");
  const okayButton = document.getElementById("okayButton");
  const cancelButton = document.getElementById("cancelButton");

  // Hide the popup and reset button opacity
  popup.style.display = "none";
  // okayButton.style.opacity = "0";
  // cancelButton.style.opacity = "0";

  // Reset the delete action function
  deleteAction = null;
}

// Example of using the delete function with a specific event ID
function deleteEvent(eventId) {
  // Show the confirmation popup for deletion
  showDeleteConfirmation(eventId);
}
