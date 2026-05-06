const navLinks = document.querySelectorAll('.sidebar-nav a');
const sections = document.querySelectorAll('.section');

console.log("links and sections",navLinks,sections);

try {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Get the target ID from data-section
            const target = link.getAttribute('data-section');


            // 2. Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // 3. Show the clicked section
            const activeSection = document.getElementById(`section-${target}`);
            if (activeSection) {
                activeSection.style.display = 'block';
            }
        });
    });
} catch(error){
    console.log(error);
}

// Optional: Set the default view to Dashboard on load
// document.getElementById('section-dashboard').style.display = 'block';