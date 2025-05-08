  const toggler = document.querySelector('.navbar-toggler');
  const icon = toggler.querySelector('.navbar-toggler-icon');
  const closeIcon = toggler.querySelector('.close-icon');
  const collapseMenu = document.getElementById('navbarNav');

  // Toggle the icons based on menu state
  collapseMenu.addEventListener('show.bs.collapse', () => {
    icon.classList.add('d-none');      // Hide the hamburger icon
    closeIcon.classList.remove('d-none'); // Show the close icon
  });

  collapseMenu.addEventListener('hide.bs.collapse', () => {
    icon.classList.remove('d-none');  // Show the hamburger icon
    closeIcon.classList.add('d-none'); // Hide the close icon
  });

