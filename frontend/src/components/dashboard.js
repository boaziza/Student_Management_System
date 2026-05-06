const navLinks = document.querySelectorAll('.sidebar-nav a');
const sections = document.querySelectorAll('.section');

try {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const target = link.getAttribute('data-section');

            sections.forEach(section => {
                section.style.display = 'none';
            });

            const activeSection = document.getElementById(`section-${target}`);
            if (activeSection) {
                activeSection.style.display = 'block';
            }
        });
    });
} catch(error){
    console.log(error);
}