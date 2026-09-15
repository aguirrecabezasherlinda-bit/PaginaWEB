document.addEventListener('DOMContentLoaded', () => {
  const components = document.querySelectorAll('[data-component]');

  components.forEach(async (element) => {
    const url = element.getAttribute('data-component');

    if (!url) return;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`No se pudo cargar ${url}: ${response.status}`);
      }

      const html = await response.text();
      element.innerHTML = html;
    } catch (error) {
      console.error(error);
      element.innerHTML = '<p style="color:#b91c1c; font-family: sans-serif;">No se pudo cargar el componente.</p>';
    }
  });
});
