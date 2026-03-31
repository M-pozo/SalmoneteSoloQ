const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("image");
const dropText = document.getElementById("drop-text");

// Abrir selector al hacer clic
dropZone.addEventListener("click", () => fileInput.click());

// Cuando se selecciona archivo
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    dropText.textContent = fileInput.files[0].name;
  }
});

// Drag & Drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("border-green-400");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("border-green-400");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("border-green-400");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    dropText.textContent = files[0].name;
  }
});
